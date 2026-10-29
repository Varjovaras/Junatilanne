import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineCachedFunction } from "nitro/cache";
import type { Coordinate, TrackDistances } from "@/lib/railway/graph";
import { getTrackDistancesForLines } from "@/lib/railway/graph";
import type { TrainType } from "../../types/trainTypes";
import { getCachedTrainByDate } from "./getCachedTrainByDate";

const TRAIN_DISTANCES_CACHE_MAX_AGE_SECONDS = 5;
const TRAIN_DISTANCES_CACHE_STALE_MAX_AGE_SECONDS = 30;

// The railway network is static per deploy, so the parsed lines live for the
// process lifetime. The track graph and the station-pair segment cache inside
// trackDistance.ts are module-level as well, so they are built once per server
// process and shared by every visitor: the first request for a route pays the
// cost, every later one is a cache hit.
let linesPromise: Promise<Coordinate[][]> | undefined;

const loadRailwayLines = async (): Promise<Coordinate[][]> => {
    if (linesPromise) return linesPromise;

    linesPromise = (async () => {
        const candidates = [
            resolve("public/finland-railways.geojson"),
            resolve(".output/public/finland-railways.geojson"),
        ];
        for (const path of candidates) {
            try {
                const raw = await readFile(path, "utf8");
                const geojson = JSON.parse(raw) as {
                    features: Array<{ geometry: { coordinates: Coordinate[][] } }>;
                };
                return geojson.features[0]?.geometry.coordinates ?? [];
            } catch {
                // Try the next candidate path.
            }
        }
        throw new Error(`Railway data not found at ${candidates.join(" or ")}`);
    })();

    return linesPromise;
};

// Computes distances from a train that was already fetched. The detail page
// uses this so it does not have to fetch the dated train again just to measure
// distance from a live train.
export const getTrackDistancesForTrain = async (train: TrainType): Promise<TrackDistances | null> =>
    getTrackDistancesForLines(train, await loadRailwayLines());

// Distances are precomputed on the server and cached per train (5 s max age
// with stale-while-revalidate), so repeated polls and other visitors do not
// recompute or refetch the train from Fintraffic for every request.
export const getCachedTrainDistances = defineCachedFunction(
    async (trainId: string): Promise<TrackDistances | null> => {
        const train = await getCachedTrainByDate(trainId);
        if (!train) return null;

        return getTrackDistancesForTrain(train);
    },
    {
        name: "train-distances",
        maxAge: TRAIN_DISTANCES_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: TRAIN_DISTANCES_CACHE_STALE_MAX_AGE_SECONDS,
        getKey: (trainId: string) => trainId,
    },
);

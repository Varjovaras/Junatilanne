import { defineCachedFunction } from "nitro/cache";
import type { TrackDistances } from "@/lib/railway/graph";
import { getTrackDistancesForLines } from "@/lib/railway/graph";
import { loadRailwayLines } from "@/lib/railway/lines";
import type { TrainType } from "../../types/trainTypes";
import { getCachedTrainByDate } from "./getCachedTrainByDate";

const TRAIN_DISTANCES_CACHE_MAX_AGE_SECONDS = 5;
const TRAIN_DISTANCES_CACHE_STALE_MAX_AGE_SECONDS = 30;

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

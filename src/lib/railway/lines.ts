import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Coordinate } from "./graph";

// The railway network is static per deploy, so the parsed lines live for the
// process lifetime. The track graph and the station-pair segment cache inside
// graph.ts are module-level as well, so they are built once per server process
// and shared by every visitor: the first request for a route pays the cost,
// every later one is a cache hit.
let linesPromise: Promise<Coordinate[][]> | undefined;

export const loadRailwayLines = async (): Promise<Coordinate[][]> => {
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

    // Do not cache a failed load for the process lifetime: a transient read or
    // parse error should not permanently disable track distances.
    linesPromise.catch(() => {
        linesPromise = undefined;
    });

    return linesPromise;
};

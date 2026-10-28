import { defineCachedFunction } from "nitro/cache";
import type { StationMetadata } from "../../types/stationTypes";
import { getStationMetadata } from "./getStationMetadata";

const STATION_METADATA_CACHE_MAX_AGE_SECONDS = 86_400;
// Serve the previous snapshot while a background refresh runs, so a cold
// client never waits for Digitraffic.
const STATION_METADATA_CACHE_STALE_MAX_AGE_SECONDS = 604_800;

export const getCachedStationMetadata = defineCachedFunction(
    async (): Promise<StationMetadata[]> => getStationMetadata(),
    {
        name: "station-metadata",
        maxAge: STATION_METADATA_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: STATION_METADATA_CACHE_STALE_MAX_AGE_SECONDS,
    },
);

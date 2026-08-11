import { defineCachedFunction } from "nitro/cache";
import type { StationSchedule } from "../types/stationTypes";
import { getStationData } from "./getStationData";

export const STATION_CACHE_MAX_AGE_SECONDS = 60;
export const STATION_CACHE_STALE_MAX_AGE_SECONDS = 120;

export const getCachedStationData = defineCachedFunction(
    async (stationId: string): Promise<StationSchedule[]> => getStationData(stationId),
    {
        name: "station-schedules",
        maxAge: STATION_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: STATION_CACHE_STALE_MAX_AGE_SECONDS,
        getKey: (stationId: string) => stationId,
    },
);

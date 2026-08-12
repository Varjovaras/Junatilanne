import { defineCachedFunction } from "nitro/cache";
import type { StationSchedule } from "../types/stationTypes";
import { getStationSchedulesByDate } from "./getStationSchedulesByDate";

export const STATION_SCHEDULES_BY_DATE_CACHE_MAX_AGE_SECONDS = 60;
export const STATION_SCHEDULES_BY_DATE_STALE_MAX_AGE_SECONDS = 120;

export const getCachedStationSchedulesByDate = defineCachedFunction(
    async (stationId: string, date: string): Promise<StationSchedule[]> =>
        getStationSchedulesByDate(stationId, date),
    {
        name: "station-schedules-by-date",
        maxAge: STATION_SCHEDULES_BY_DATE_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: STATION_SCHEDULES_BY_DATE_STALE_MAX_AGE_SECONDS,
        getKey: (stationId: string, date: string) => `${stationId}:${date}`,
    },
);

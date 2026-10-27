import { queryOptions } from "@tanstack/react-query";
import type { StationSchedule } from "../../types/stationTypes";
import { isToday, isTomorrow, todayInHelsinki } from "../../utils/dateUtils";
import { sortSchedules } from "../../utils/sortSchedules";
import { normalizeStationId, queryKeys } from "../shared/queryKeys";
import { fetchStationSchedulesByDate } from "./server";

export const STATION_SCHEDULES_REFETCH_INTERVAL_MS = 60_000;

export const stationSchedulesQueryOptions = (stationId: string) => {
    const normalizedStationId = normalizeStationId(stationId);

    return queryOptions({
        queryKey: queryKeys.stationSchedules(normalizedStationId),
        queryFn: () =>
            fetchStationSchedulesByDate({
                data: { stationId: normalizedStationId, date: todayInHelsinki() },
            }),
        refetchInterval: STATION_SCHEDULES_REFETCH_INTERVAL_MS,
        select: (schedules: StationSchedule[]) => ({
            stationId: normalizedStationId,
            schedules: sortSchedules(schedules, normalizedStationId),
        }),
    });
};

export const stationScheduleByDateQueryOptions = (stationId: string, date: string) => {
    const normalizedStationId = normalizeStationId(stationId);

    return queryOptions({
        queryKey: queryKeys.stationSchedulesByDate(normalizedStationId, date),
        queryFn: () =>
            fetchStationSchedulesByDate({ data: { stationId: normalizedStationId, date } }),
        refetchInterval:
            isToday(date) || isTomorrow(date) ? STATION_SCHEDULES_REFETCH_INTERVAL_MS : false,
        select: (schedules: StationSchedule[]) => ({
            stationId: normalizedStationId,
            date,
            schedules: sortSchedules(schedules, normalizedStationId),
        }),
    });
};

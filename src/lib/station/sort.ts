import type { StationSchedule } from "../types/stationTypes";
import { getFirstStationRow } from "./schedule";

export const sortSchedules = (schedules: StationSchedule[], stationId: string) => {
    return schedules
        .map((schedule) => {
            const stationRow = getFirstStationRow(schedule, stationId);
            const scheduledTime = stationRow?.scheduledTime;

            return {
                schedule,
                stationTime: scheduledTime ? new Date(scheduledTime).getTime() : undefined,
            };
        })
        .sort(
            (a, b) =>
                (a.stationTime ?? Number.POSITIVE_INFINITY) -
                (b.stationTime ?? Number.POSITIVE_INFINITY),
        )
        .map(({ schedule }) => schedule);
};

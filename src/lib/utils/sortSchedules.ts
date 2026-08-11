import type { StationSchedule } from "../types/stationTypes";
import { findStationDepartureWithId } from "./scheduleUtils";
import { findStationArrivalWithId } from "./trainStations";

export const sortSchedules = (schedules: StationSchedule[], stationId: string) => {
    return schedules
        .map((schedule) => {
            const stationRow =
                findStationDepartureWithId(schedule, stationId) ??
                findStationArrivalWithId(schedule, stationId);
            const scheduledTime = stationRow?.scheduledTime;

            return {
                schedule,
                stationTime: scheduledTime ? new Date(scheduledTime).getTime() : undefined,
            };
        })
        .sort((a, b) => {
            if (a.stationTime === undefined || b.stationTime === undefined) return 0;

            return a.stationTime - b.stationTime;
        })
        .map(({ schedule }) => schedule);
};

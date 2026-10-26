import type { StationSchedule } from "../types/stationTypes";
import { getNextStationRow, getStationRowTime } from "./trainStations";

// A schedule is still relevant while it has an arrival or departure at the
// station ahead of it. This uses the live estimate for delayed trains, so a
// train stays visible until its new estimated time has passed.
export const scheduleHasUpcomingStop = (
    schedule: StationSchedule,
    stationId: string,
    now = Date.now(),
): boolean => getNextStationRow(schedule, stationId, now) !== undefined;

export const filterSchedulesWithUpcomingStop = (
    stationSchedules: StationSchedule[],
    stationId: string,
    now = Date.now(),
): StationSchedule[] =>
    stationSchedules.filter((schedule) => scheduleHasUpcomingStop(schedule, stationId, now));

export const stationScheduleFilter = (
    stationSchedules: StationSchedule[],
    stationId: string,
    now = Date.now(),
): StationSchedule[] => {
    // A round trip can visit the station twice. Use the next future arrival or
    // departure instead of only the first departure, otherwise a train whose
    // outward departure has passed but whose return arrival is still ahead is
    // dropped from "upcoming".
    const filtered: Array<{ schedule: StationSchedule; stationTime: number }> = [];

    for (const schedule of stationSchedules) {
        const stationRow = getNextStationRow(schedule, stationId, now);
        if (!stationRow) continue;

        const stationTime = getStationRowTime(stationRow);
        if (!Number.isFinite(stationTime)) continue;

        filtered.push({ schedule, stationTime });
    }

    return filtered.sort((a, b) => a.stationTime - b.stationTime).map(({ schedule }) => schedule);
};

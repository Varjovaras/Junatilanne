import type { StationSchedule, StationTimeTableRow } from "../types/stationTypes";
import {
    getNextStationRow,
    getNextStationRowOfType,
    getStationRowTime,
    getStationRows,
    type StationRowType,
} from "./schedule";

export type StationScheduleEntry = {
    schedule: StationSchedule;
    row: StationTimeTableRow;
    time: number;
};

// A schedule is still relevant while it has an arrival or departure at the
// station ahead of it. This uses the live estimate for delayed trains, so a
// train stays visible until its new estimated time has passed.
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

const toEntry = (
    schedule: StationSchedule,
    row: StationTimeTableRow,
): StationScheduleEntry | undefined => {
    const time = getStationRowTime(row);
    return Number.isFinite(time) ? { schedule, row, time } : undefined;
};

// Upcoming events of a single type (arrivals or departures) at the station,
// one entry per train visit, sorted by the event time.
export const getUpcomingStationEntries = (
    stationSchedules: StationSchedule[],
    stationId: string,
    type: StationRowType,
    now = Date.now(),
): StationScheduleEntry[] =>
    stationSchedules
        .map((schedule) => {
            const row = getNextStationRowOfType(schedule, stationId, type, now);
            return row ? toEntry(schedule, row) : undefined;
        })
        .filter((entry): entry is StationScheduleEntry => entry !== undefined)
        .sort((a, b) => a.time - b.time);

// All events of a single type for a schedule day, including past events and
// every visit of a round trip.
export const getStationDayEntries = (
    stationSchedules: StationSchedule[],
    stationId: string,
    type: StationRowType,
): StationScheduleEntry[] =>
    stationSchedules
        .flatMap((schedule) =>
            getStationRows(schedule, stationId)
                .filter((row) => row.type === type)
                .map((row) => toEntry(schedule, row))
                .filter((entry): entry is StationScheduleEntry => entry !== undefined),
        )
        .sort((a, b) => a.time - b.time);

import type { StationSchedule, StationTimeTableRow } from "../types/stationTypes";

export type StationRowType = StationTimeTableRow["type"];

export const findStationTimeTableRow = (
    schedule: StationSchedule,
    stationId: string,
    type?: "ARRIVAL" | "DEPARTURE",
): StationTimeTableRow | undefined => {
    return schedule.timeTableRows.find(
        (row) =>
            row.trainStopping &&
            row.stationShortCode === stationId &&
            (type === undefined || row.type === type),
    );
};

export const findStationArrivalWithId = (schedule: StationSchedule, stationId: string) => {
    return findStationTimeTableRow(schedule, stationId, "ARRIVAL");
};

export const getStationRows = (
    schedule: StationSchedule,
    stationId: string,
): StationTimeTableRow[] =>
    schedule.timeTableRows.filter((row) => row.stationShortCode === stationId && row.trainStopping);

// A delayed train should stay in "upcoming" until its estimated time has
// passed, so prefer actual time, then the live estimate, then the timetable.
export const getStationRowTime = (row: StationTimeTableRow): number =>
    new Date(row.actualTime ?? row.liveEstimateTime ?? row.scheduledTime).getTime();

// A journey is complete once the train has reached its final row, or once the
// final time has passed and the train is no longer running.
export const isJourneyCompleted = (schedule: StationSchedule, now = Date.now()): boolean => {
    if (schedule.cancelled) return false;

    const finalRow = schedule.timeTableRows[schedule.timeTableRows.length - 1];
    if (!finalRow || finalRow.cancelled) return false;
    if (finalRow.actualTime) return true;

    return !schedule.runningCurrently && getStationRowTime(finalRow) < now;
};

const isUpcomingRow = (row: StationTimeTableRow, now: number): boolean => {
    const time = getStationRowTime(row);
    return Number.isFinite(time) && time >= now;
};

export const getNextStationRow = (
    schedule: StationSchedule,
    stationId: string,
    now = Date.now(),
): StationTimeTableRow | undefined =>
    getStationRows(schedule, stationId)
        .filter((row) => isUpcomingRow(row, now))
        .sort((a, b) => getStationRowTime(a) - getStationRowTime(b))[0];

export const getNextStationRowOfType = (
    schedule: StationSchedule,
    stationId: string,
    type: StationRowType,
    now = Date.now(),
): StationTimeTableRow | undefined =>
    getStationRows(schedule, stationId)
        .filter((row) => row.type === type && isUpcomingRow(row, now))
        .sort((a, b) => getStationRowTime(a) - getStationRowTime(b))[0];

export const getFirstStationRow = (
    schedule: StationSchedule,
    stationId: string,
): StationTimeTableRow | undefined =>
    getStationRows(schedule, stationId).sort(
        (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime(),
    )[0];

export const isStationTerminus = (schedule: StationSchedule, stationId: string): boolean => {
    return (
        findStationArrivalWithId(schedule, stationId) !== undefined &&
        findStationTimeTableRow(schedule, stationId, "DEPARTURE") === undefined
    );
};

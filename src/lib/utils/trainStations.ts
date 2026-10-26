import type { StationSchedule, StationTimeTableRow } from "../types/stationTypes";
import type { TimeTableRow, TrainType } from "../types/trainTypes";

export const getDelayByStation = (
    timeTableRows: TimeTableRow[],
    stationName: string,
): number | undefined => {
    let station = timeTableRows.find(
        (row) => row.station.name === stationName && row.type === "DEPARTURE",
    );
    if (!station) {
        station = timeTableRows.find((row) => row.station.shortCode === stationName);
    }
    return station?.differenceInMinutes;
};

export const getCommercialStations = (
    timeTableRows: TimeTableRow[],
    type?: "ARRIVAL" | "DEPARTURE",
): TimeTableRow[] => {
    return timeTableRows.filter((row) => {
        const isCommercial = row.trainStopping && row.commercialStop === true;
        return type ? isCommercial && row.type === type : isCommercial;
    });
};

// The ordered, non-cancelled commercial arrivals of a train. This is the
// sequence of stations the train actually stops at, used as the route for
// distance calculations.
export const getCommercialArrivalStations = (train: TrainType): TimeTableRow[] => {
    return getCommercialStations(train.timeTableRows, "ARRIVAL").filter((row) => !row.cancelled);
};

export const getVisitedStations = (
    timeTableRows: TimeTableRow[],
    commercialOnly = false,
): TimeTableRow[] => {
    return timeTableRows.filter((row) => {
        const hasActualTime = row.actualTime !== null;
        return commercialOnly
            ? hasActualTime && row.trainStopping && row.commercialStop === true
            : hasActualTime;
    });
};

export const getLatestVisitedStationName = (train: TrainType): string | null => {
    const visitedStations = getVisitedStations(train.timeTableRows, true);

    if (visitedStations.length === 0) {
        const firstDeparture = train.timeTableRows.find(
            (row) => row.trainStopping && row.commercialStop === true && row.type === "DEPARTURE",
        );
        return firstDeparture?.station.name ?? null;
    }

    const lastVisitedStation = visitedStations[visitedStations.length - 1];
    const departureStation = train.timeTableRows[0].station.name;

    if (
        lastVisitedStation.station.name === departureStation &&
        lastVisitedStation.type === "DEPARTURE"
    ) {
        return departureStation;
    }

    return lastVisitedStation.station.name;
};

export const getLastVisitedRowIndex = (timeTableRows: TimeTableRow[]): number =>
    timeTableRows.reduce(
        (lastIndex, row, index) => (row.actualTime !== null ? index : lastIndex),
        -1,
    );

export const getNextCommercialStation = (train: TrainType): TimeTableRow | undefined => {
    const timeTableRows = train.timeTableRows;
    const commercialArrivals = getCommercialStations(timeTableRows, "ARRIVAL");

    const lastVisitedRowIndex = getLastVisitedRowIndex(timeTableRows);

    return commercialArrivals.find(
        (row) => !row.cancelled && timeTableRows.indexOf(row) > lastVisitedRowIndex,
    );
};

export const calculateTrainProgress = (train: TrainType) => {
    const timeTableRows = train.timeTableRows;
    const commercialStops = getCommercialStations(timeTableRows, "ARRIVAL");

    const lastVisitedRowIndex = getLastVisitedRowIndex(timeTableRows);

    let completed = 0;
    let lastCompletedStop: TimeTableRow | null = null;
    let nextStop: TimeTableRow | null = null;

    for (const stop of commercialStops) {
        const isBehind = timeTableRows.indexOf(stop) <= lastVisitedRowIndex;

        if (isBehind && !stop.cancelled) {
            completed += 1;
            lastCompletedStop = stop;
        } else if (!isBehind && !stop.cancelled && nextStop === null) {
            nextStop = stop;
        }
    }

    const total = commercialStops.length;
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

    return {
        completed,
        total,
        percentage: progressPercentage,
        lastCompletedStop,
        nextStop,
    };
};

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

export const getNextStationRow = (
    schedule: StationSchedule,
    stationId: string,
    now = Date.now(),
): StationTimeTableRow | undefined =>
    getStationRows(schedule, stationId)
        .map((row) => ({ row, time: getStationRowTime(row) }))
        .filter(({ time }) => Number.isFinite(time) && time >= now)
        .sort((a, b) => a.time - b.time)[0]?.row;

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

export const getAirportStop = (train: TrainType): TimeTableRow | undefined => {
    const airportRows = train.timeTableRows.filter(
        (row) => row.trainStopping && row.station.shortCode === "LEN",
    );
    return airportRows.find((row) => row.type === "ARRIVAL") ?? airportRows[0];
};

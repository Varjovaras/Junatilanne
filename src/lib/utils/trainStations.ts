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

const getLastVisitedRowIndex = (timeTableRows: TimeTableRow[]): number =>
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

import type { StationSchedule, StationTimeTableRow } from "../../types/stationTypes";
import type {
    StationScheduleGraphQLRow,
    StationScheduleGraphQLTrain,
} from "./stationScheduleQuery";

const hasStation = (
    row: StationScheduleGraphQLRow,
): row is StationScheduleGraphQLRow & {
    station: NonNullable<StationScheduleGraphQLRow["station"]>;
} => row.station !== null;

type StationScheduleWindow = {
    startMs: number;
    endMs: number;
};

const isWithinWindow = (scheduledTime: string, window: StationScheduleWindow): boolean => {
    const time = new Date(scheduledTime).getTime();
    return Number.isFinite(time) && time >= window.startMs && time < window.endMs;
};

export const adaptStationSchedule = (
    train: StationScheduleGraphQLTrain,
    stationId: string,
    window: StationScheduleWindow,
): StationSchedule | null => {
    const allRows = train.timeTableRows.filter(hasStation).map(
        (row): StationTimeTableRow => ({
            stationShortCode: row.station.shortCode,
            stationUICCode: row.station.uicCode,
            countryCode: row.station.countryCode,
            type: row.type,
            trainStopping: row.trainStopping,
            commercialStop: Boolean(row.commercialStop),
            commercialTrack: row.commercialTrack,
            cancelled: row.cancelled,
            scheduledTime: row.scheduledTime,
            actualTime: row.actualTime ?? undefined,
            liveEstimateTime: row.liveEstimateTime ?? undefined,
            differenceInMinutes: row.differenceInMinutes,
            causes: row.causes ?? [],
        }),
    );

    // A station page only needs the rows at that station plus the route's
    // origin and destination for display. Keeping every intermediate row makes
    // the SSR payload huge (tens of thousands of rows per day) and can exceed
    // the router's maximum buffered SSR output.
    //
    // A train can visit the same station twice (for example the I/P airport
    // loop), and the GraphQL query matches the whole train if one visit is in
    // the selected day. Keep only the visits that actually belong to the day.
    const timeTableRows = allRows.filter(
        (row) =>
            row.stationShortCode === stationId &&
            row.trainStopping &&
            isWithinWindow(row.scheduledTime, window),
    );

    if (timeTableRows.length === 0) return null;

    const originRow = allRows[0];
    const destinationRow = allRows[allRows.length - 1];

    if (originRow && originRow.stationShortCode !== stationId) {
        timeTableRows.unshift(originRow);
    }
    if (destinationRow && destinationRow.stationShortCode !== stationId) {
        timeTableRows.push(destinationRow);
    }

    return {
        trainNumber: train.trainNumber,
        departureDate: train.departureDate.slice(0, 10),
        trainType: train.trainType.name,
        trainCategory: train.trainType.trainCategory.name,
        commuterLineID: train.commuterLineid ?? "",
        runningCurrently: train.runningCurrently,
        cancelled: train.cancelled,
        timeTableRows,
    };
};

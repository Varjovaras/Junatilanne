import type { StationSchedule, StationTimeTableRow } from "../types/stationTypes";
import type {
    StationScheduleGraphQLRow,
    StationScheduleGraphQLTrain,
} from "./graphql/stationScheduleQuery";

const toDateString = (date: Date | string): string => {
    if (date instanceof Date) return date.toISOString();
    return String(date);
};

const hasStation = (
    row: StationScheduleGraphQLRow,
): row is StationScheduleGraphQLRow & {
    station: NonNullable<StationScheduleGraphQLRow["station"]>;
} => row.station !== null;

export const adaptStationSchedule = (
    train: StationScheduleGraphQLTrain,
    stationId: string,
): StationSchedule => {
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
            scheduledTime: toDateString(row.scheduledTime),
            actualTime: row.actualTime ? toDateString(row.actualTime) : undefined,
            liveEstimateTime: row.liveEstimateTime ? toDateString(row.liveEstimateTime) : undefined,
            estimateSource: row.estimateSourceType,
            differenceInMinutes: row.differenceInMinutes,
            causes: row.causes ?? [],
        }),
    );

    // A station page only needs the rows at that station plus the route's
    // origin and destination for display. Keeping every intermediate row makes
    // the SSR payload huge (tens of thousands of rows per day) and can exceed
    // the router's maximum buffered SSR output.
    const timeTableRows = allRows.filter((row) => row.stationShortCode === stationId);
    const originRow = allRows[0];
    const destinationRow = allRows[allRows.length - 1];

    if (originRow && !timeTableRows.includes(originRow)) {
        timeTableRows.unshift(originRow);
    }
    if (destinationRow && !timeTableRows.includes(destinationRow)) {
        timeTableRows.push(destinationRow);
    }

    return {
        trainNumber: train.trainNumber,
        departureDate: toDateString(train.departureDate).slice(0, 10),
        operatorUICCode: 0,
        operatorShortCode: "",
        trainType: train.trainType.name,
        trainCategory: train.trainType.trainCategory.name,
        commuterLineID: train.commuterLineid ?? "",
        runningCurrently: train.runningCurrently,
        cancelled: train.cancelled,
        version: train.version,
        timetableType: train.timetableType,
        timetableAcceptanceDate: "",
        timeTableRows,
    };
};

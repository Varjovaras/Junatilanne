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

export const adaptStationSchedule = (train: StationScheduleGraphQLTrain): StationSchedule => ({
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
    timeTableRows: train.timeTableRows.filter(hasStation).map(
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
    ),
});

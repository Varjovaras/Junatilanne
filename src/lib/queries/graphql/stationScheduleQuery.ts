import { addDays, getHelsinkiDayWindow } from "../../utils/dateUtils";
import { processGraphQLQuery } from "../../utils/queryUtils";

const trainFields = `{
    cancelled
    commuterLineid
    departureDate
    runningCurrently
    trainNumber
    version
    timetableType
    trainType {
        name
        trainCategory {
            name
        }
    }
    timeTableRows {
        type
        trainStopping
        commercialStop
        commercialTrack
        cancelled
        scheduledTime
        actualTime
        differenceInMinutes
        liveEstimateTime
        estimateSourceType
        station {
            countryCode
            shortCode
            uicCode
        }
        causes {
            categoryCode {
                code
                name
                validFrom
                validTo
            }
            detailedCategoryCode {
                code
                name
                validFrom
                validTo
            }
            thirdCategoryCode {
                code
                name
                validFrom
                validTo
            }
        }
    }
}`;

export const getStationScheduleQuery = (stationId: string, date: string) => {
    const { startIso, endIso } = getHelsinkiDayWindow(date);
    const windowFilter = `timeTableRows: { contains: { station: { shortCode: { equals: "${stationId}" } }, scheduledTime: { greaterThan: "${startIso}", lessThan: "${endIso}" } } }`;
    const day = (departureDate: string, alias: string) =>
        `  ${alias}: trainsByDepartureDate(departureDate: "${departureDate}", where: { ${windowFilter} }) ${trainFields}`;

    // Night trains are keyed by their journey start date, so query the previous
    // day too and union the results.
    return processGraphQLQuery(`{
        ${day(addDays(date, -1), "previousDay")}
        ${day(date, "selectedDay")}
    }`);
};

export type StationScheduleGraphQLTrain = {
    cancelled: boolean;
    commuterLineid: string;
    departureDate: Date;
    runningCurrently: boolean;
    trainNumber: number;
    version: number;
    timetableType: string;
    trainType: {
        name: string;
        trainCategory: {
            name: string;
        };
    };
    timeTableRows: StationScheduleGraphQLRow[];
};

export type StationScheduleGraphQLRow = {
    type: "ARRIVAL" | "DEPARTURE";
    trainStopping: boolean;
    commercialStop: boolean | null;
    commercialTrack: string;
    cancelled: boolean;
    scheduledTime: Date | string;
    actualTime?: Date | string | null;
    differenceInMinutes: number;
    liveEstimateTime?: Date | string | null;
    estimateSourceType?: string;
    station: {
        countryCode: string;
        shortCode: string;
        uicCode: number;
    } | null;
    causes: Causes | null;
};

export type Causes = Array<{
    categoryCode: { code: string; name: string; validFrom: string; validTo: string | null };
    detailedCategoryCode: { code: string; name: string; validFrom: string; validTo: string | null };
    thirdCategoryCode: { code: string; name: string; validFrom: string; validTo: string | null };
}>;

export type StationScheduleGraphQLResponse = {
    data: {
        previousDay: StationScheduleGraphQLTrain[];
        selectedDay: StationScheduleGraphQLTrain[];
    };
};

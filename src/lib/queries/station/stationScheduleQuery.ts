import type { Cause } from "../../types/trainTypes";
import { addDays, getHelsinkiDayWindow } from "@/lib/utils/date";
import { processGraphQLQuery } from "@/lib/queries/shared/queryUtils";

const trainFields = `{
    cancelled
    commuterLineid
    departureDate
    runningCurrently
    trainNumber
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

    // Night trains are keyed by their journey start date, so query the previous
    // day too and union the results.
    return {
        query: processGraphQLQuery(`
query StationSchedule(
    $stationId: String!
    $previousDate: Date!
    $selectedDate: Date!
    $startIso: DateTime!
    $endIso: DateTime!
) {
    previousDay: trainsByDepartureDate(
        departureDate: $previousDate
        where: {
            timeTableRows: {
                contains: {
                    station: { shortCode: { equals: $stationId } }
                    trainStopping: { equals: true }
                    scheduledTime: { greaterThan: $startIso, lessThan: $endIso }
                }
            }
        }
    ) ${trainFields}
    selectedDay: trainsByDepartureDate(
        departureDate: $selectedDate
        where: {
            timeTableRows: {
                contains: {
                    station: { shortCode: { equals: $stationId } }
                    trainStopping: { equals: true }
                    scheduledTime: { greaterThan: $startIso, lessThan: $endIso }
                }
            }
        }
    ) ${trainFields}
}
`),
        variables: {
            stationId,
            previousDate: addDays(date, -1),
            selectedDate: date,
            startIso,
            endIso,
        },
    };
};

export type StationScheduleGraphQLTrain = {
    cancelled: boolean;
    commuterLineid: string;
    departureDate: string;
    runningCurrently: boolean;
    trainNumber: number;
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
    scheduledTime: string;
    actualTime: string | null;
    differenceInMinutes: number;
    liveEstimateTime: string | null;
    station: {
        countryCode: string;
        shortCode: string;
        uicCode: number;
    } | null;
    causes: Cause[] | null;
};

export type StationScheduleGraphQLResponse = {
    data: {
        previousDay: StationScheduleGraphQLTrain[];
        selectedDay: StationScheduleGraphQLTrain[];
    };
};

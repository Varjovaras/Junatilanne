import type { StationSchedule } from "../types/stationTypes";
import { getStationScheduleQuery } from "./graphql/stationScheduleQuery";
import type { StationScheduleGraphQLResponse } from "./graphql/stationScheduleQuery";
import { graphqlFetch } from "./graphqlClient";
import { adaptStationSchedule } from "./stationScheduleAdapter";

export const getStationSchedulesByDate = async (
    stationId: string,
    date: string,
): Promise<StationSchedule[]> => {
    const response = await graphqlFetch<StationScheduleGraphQLResponse>(
        getStationScheduleQuery(stationId, date),
    );

    const trains = [...response.data.previousDay, ...response.data.selectedDay];
    const seen = new Set<string>();
    const unique = trains.filter((train) => {
        const key = `${train.trainNumber}-${String(train.departureDate).slice(0, 10)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return unique.map(adaptStationSchedule);
};

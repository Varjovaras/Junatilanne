import { getHelsinkiDayWindow } from "@/lib/utils/date";
import type { StationSchedule } from "../../types/stationTypes";
import { getStationScheduleQuery } from "./stationScheduleQuery";
import type { StationScheduleGraphQLResponse } from "./stationScheduleQuery";
import { graphqlFetch } from "../shared/graphqlClient";
import { adaptStationSchedule } from "./stationScheduleAdapter";

export const getStationSchedulesByDate = async (
    stationId: string,
    date: string,
): Promise<StationSchedule[]> => {
    const window = getHelsinkiDayWindow(date);
    const { query, variables } = getStationScheduleQuery(stationId, date);
    const response = await graphqlFetch<StationScheduleGraphQLResponse>(query, { variables });

    const trains = [...response.data.previousDay, ...response.data.selectedDay];
    const seen = new Set<string>();
    const unique = trains.filter((train) => {
        const key = `${train.trainNumber}-${String(train.departureDate).slice(0, 10)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const schedules = unique.map((train) => adaptStationSchedule(train, stationId, window));

    return schedules.filter((schedule): schedule is StationSchedule => schedule !== null);
};

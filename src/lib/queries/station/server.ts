import { createServerFn } from "@tanstack/react-start";

export const fetchStationSchedulesByDate = createServerFn({ method: "GET" })
    .validator((params: { stationId: string; date: string }) => params)
    .handler(async ({ data }) => {
        const { getCachedStationSchedulesByDate } =
            await import("./getCachedStationSchedulesByDate");

        return getCachedStationSchedulesByDate(data.stationId, data.date);
    });

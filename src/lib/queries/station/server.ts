import { createServerFn } from "@tanstack/react-start";
import { validateStationScheduleParams } from "@/lib/station/validation";

export const fetchStationSchedulesByDate = createServerFn({ method: "GET" })
    .validator((params: unknown) => validateStationScheduleParams(params))
    .handler(async ({ data }) => {
        const { getCachedStationSchedulesByDate } =
            await import("./getCachedStationSchedulesByDate");

        return getCachedStationSchedulesByDate(data.stationId, data.date);
    });

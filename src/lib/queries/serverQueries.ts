import { createServerFn } from "@tanstack/react-start";
import { getStationMetadata } from "./getStationMetadata";
import { getStationMessages } from "./getStationMessages";
import { getTrainByDateData } from "./getTrainByDateData";

export const fetchTrainData = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedTrains } = await import("./getCachedTrains");

    return getCachedTrains();
});

export const fetchStationSchedulesByDate = createServerFn({ method: "GET" })
    .validator((params: { stationId: string; date: string }) => params)
    .handler(async ({ data }) => {
        const { getCachedStationSchedulesByDate } =
            await import("./getCachedStationSchedulesByDate");

        return getCachedStationSchedulesByDate(data.stationId, data.date);
    });

export const fetchStationMetadata = createServerFn({ method: "GET" }).handler(() =>
    getStationMetadata(),
);

export const fetchStationMessages = createServerFn({ method: "GET" })
    .validator((stationId: string) => stationId)
    .handler(({ data: stationId }) => getStationMessages(stationId));

export const fetchTrainByDateData = createServerFn({ method: "GET" })
    .validator((trainId: string) => trainId)
    .handler(({ data: trainId }) => getTrainByDateData(trainId));

export const fetchSingleTrainData = createServerFn({ method: "GET" })
    .validator((trainNumber: string) => trainNumber)
    .handler(async ({ data: trainNumber }) => {
        const { getCachedSingleTrain } = await import("./getCachedSingleTrain");

        return getCachedSingleTrain(trainNumber);
    });

import { createServerFn } from "@tanstack/react-start";
import { getStationMetadata } from "./getStationMetadata";
import { getStationMessages } from "./getStationMessages";
import { getTrainByDateData } from "./getTrainByDateData";

export const fetchTrainData = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedTrains } = await import("./getCachedTrains");

    return getCachedTrains();
});

export const fetchStationData = createServerFn({ method: "GET" })
    .validator((stationId: string) => stationId)
    .handler(async ({ data: stationId }) => {
        const { getCachedStationData } = await import("./getCachedStationData");

        return getCachedStationData(stationId);
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

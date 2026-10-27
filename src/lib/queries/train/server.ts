import { createServerFn } from "@tanstack/react-start";
import { getTrainByDateData } from "./getTrainByDateData";

export const fetchTrainByDateData = createServerFn({ method: "GET" })
    .validator((trainId: string) => trainId)
    .handler(({ data: trainId }) => getTrainByDateData(trainId));

export const fetchSingleTrainData = createServerFn({ method: "GET" })
    .validator((trainNumber: string) => trainNumber)
    .handler(async ({ data: trainNumber }) => {
        const { getCachedSingleTrain } = await import("./getCachedSingleTrain");

        return getCachedSingleTrain(trainNumber);
    });

export const fetchTrainDistances = createServerFn({ method: "GET" })
    .validator((trainId: string) => trainId)
    .handler(async ({ data: trainId }) => {
        const { getCachedTrainDistances } = await import("./getCachedTrainDistances");

        return getCachedTrainDistances(trainId);
    });

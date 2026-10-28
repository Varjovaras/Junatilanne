import { createServerFn } from "@tanstack/react-start";
import { isValidDatedTrainId, isValidTrainNumber } from "@/lib/train/id";
import { getTrainByDateData } from "./getTrainByDateData";

export const fetchTrainByDateData = createServerFn({ method: "GET" })
    .validator((trainId: string) => {
        if (!isValidDatedTrainId(trainId)) {
            throw new Error("Invalid train ID");
        }

        return trainId;
    })
    .handler(({ data: trainId }) => getTrainByDateData(trainId));

export const fetchSingleTrainData = createServerFn({ method: "GET" })
    .validator((trainNumber: string) => {
        if (!isValidTrainNumber(trainNumber)) {
            throw new Error("Invalid train number");
        }

        return trainNumber;
    })
    .handler(async ({ data: trainNumber }) => {
        const { getCachedSingleTrain } = await import("./getCachedSingleTrain");

        return getCachedSingleTrain(trainNumber);
    });

export const fetchTrainDistances = createServerFn({ method: "GET" })
    .validator((trainId: string) => {
        if (!isValidDatedTrainId(trainId)) {
            throw new Error("Invalid train ID");
        }

        return trainId;
    })
    .handler(async ({ data: trainId }) => {
        const { getCachedTrainDistances } = await import("./getCachedTrainDistances");

        return getCachedTrainDistances(trainId);
    });

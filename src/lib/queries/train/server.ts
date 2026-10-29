import { createServerFn } from "@tanstack/react-start";
import { isValidDatedTrainId } from "@/lib/train/id";

const validateTrainId = (trainId: unknown): string => {
    if (typeof trainId !== "string") {
        throw new Error("Invalid train ID");
    }

    return trainId;
};

export const fetchTrainDetailsData = createServerFn({ method: "GET" })
    .validator(validateTrainId)
    .handler(async ({ data: trainId }) => {
        const { getTrainDetailsData } = await import("./getTrainDetailsData");

        return getTrainDetailsData(trainId);
    });

export const fetchTrainPageData = createServerFn({ method: "GET" })
    .validator(validateTrainId)
    .handler(async ({ data: trainId }) => {
        const { getTrainPageData } = await import("./getTrainPageData");

        return getTrainPageData(trainId);
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

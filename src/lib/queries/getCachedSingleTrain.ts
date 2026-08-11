import { defineCachedFunction } from "nitro/cache";
import type { SingleTrainResponse } from "../types/trainTypes";
import { getSingleTrainData } from "./getSingleTrainData";

export const SINGLE_TRAIN_CACHE_MAX_AGE_SECONDS = 60;
export const SINGLE_TRAIN_CACHE_STALE_MAX_AGE_SECONDS = 120;

export const getCachedSingleTrain = defineCachedFunction(
    async (trainNumber: string): Promise<SingleTrainResponse> => getSingleTrainData(trainNumber),
    {
        name: "single-train",
        maxAge: SINGLE_TRAIN_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: SINGLE_TRAIN_CACHE_STALE_MAX_AGE_SECONDS,
        getKey: (trainNumber: string) => trainNumber,
    },
);

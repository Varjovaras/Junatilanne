import { defineCachedFunction } from "nitro/cache";
import type { TrainType } from "../../types/trainTypes";
import { getTrainByDateData } from "./getTrainByDateData";

const TRAIN_BY_DATE_CACHE_MAX_AGE_SECONDS = 10;
const TRAIN_BY_DATE_CACHE_STALE_MAX_AGE_SECONDS = 30;

// The detail page and distance calculation both resolve the same dated train.
// Caching it briefly lets the combined detail request and the per-list distance
// requests share one upstream fetch instead of repeating it.
export const getCachedTrainByDate = defineCachedFunction(
    async (trainId: string): Promise<TrainType | null> => getTrainByDateData(trainId),
    {
        name: "train-by-date",
        maxAge: TRAIN_BY_DATE_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: TRAIN_BY_DATE_CACHE_STALE_MAX_AGE_SECONDS,
        getKey: (trainId: string) => trainId,
    },
);

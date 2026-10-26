import { defineCachedFunction } from "nitro/cache";
import type { CurrentlyRunningTrainResponse } from "../types/trainTypes";
import { getTrainData } from "./getTrainData";

export const HOME_TRAINS_CACHE_MAX_AGE_SECONDS = 5;
export const HOME_TRAINS_CACHE_STALE_MAX_AGE_SECONDS = 180;

export const getCachedTrains = defineCachedFunction(
    async (): Promise<CurrentlyRunningTrainResponse> => getTrainData(),
    {
        name: "home-trains",
        maxAge: HOME_TRAINS_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: HOME_TRAINS_CACHE_STALE_MAX_AGE_SECONDS,
    },
);

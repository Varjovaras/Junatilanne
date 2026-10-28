import { defineCachedFunction } from "nitro/cache";
import type { CurrentlyRunningTrainResponse } from "../../types/trainTypes";
import { getTrainData } from "./getTrainData";

const HOME_TRAINS_CACHE_MAX_AGE_SECONDS = 5;
// A scheduled task keeps this cache warm. The stale window is only a safety net
// for restarts, deploys or a missed refresh, so the first visitor still gets
// instant data (at most ~15 minutes old) instead of waiting for a cold fetch.
const HOME_TRAINS_CACHE_STALE_MAX_AGE_SECONDS = 900;

export const getCachedTrains = defineCachedFunction(
    async (): Promise<CurrentlyRunningTrainResponse> => getTrainData(),
    {
        name: "home-trains",
        maxAge: HOME_TRAINS_CACHE_MAX_AGE_SECONDS,
        swr: true,
        staleMaxAge: HOME_TRAINS_CACHE_STALE_MAX_AGE_SECONDS,
    },
);

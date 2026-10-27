import { queryOptions } from "@tanstack/react-query";
import type { TrainType } from "../../types/trainTypes";
import { queryKeys } from "../shared/queryKeys";
import { fetchTrainData } from "./server";

const HOME_TRAINS_REFETCH_INTERVAL_MS = 10_000;
const HOME_TRAINS_STALE_TIME_MS = 10_000;

export const homeTrainsQueryOptions = () =>
    queryOptions({
        queryKey: queryKeys.homeTrains,
        queryFn: () => fetchTrainData(),
        refetchInterval: HOME_TRAINS_REFETCH_INTERVAL_MS,
        staleTime: HOME_TRAINS_STALE_TIME_MS,
        select: (response) => response.data.currentlyRunningTrains as TrainType[],
    });

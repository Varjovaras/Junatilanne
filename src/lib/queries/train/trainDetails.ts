import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../shared/queryKeys";
import { fetchTrainDetailsData, fetchTrainPageData } from "./server";
import type { TrainDetailsData, TrainPageData } from "./trainDataTypes";

export const TRAIN_DETAILS_REFETCH_INTERVAL_MS = 60_000;

type TrainQueryData = TrainDetailsData | TrainPageData;

const getRefetchInterval = (query: { state: { data?: TrainQueryData } }) => {
    const data = query.state.data;
    if (data?.kind !== "live" || !data.train?.runningCurrently) {
        return false;
    }
    return TRAIN_DETAILS_REFETCH_INTERVAL_MS;
};

export const trainDetailsQueryOptions = (trainId: string) =>
    queryOptions({
        queryKey: queryKeys.trainDetails(trainId),
        queryFn: () => fetchTrainDetailsData({ data: trainId }),
        refetchInterval: getRefetchInterval,
    });

export const trainPageQueryOptions = (trainId: string) =>
    queryOptions({
        queryKey: queryKeys.trainPage(trainId),
        queryFn: () => fetchTrainPageData({ data: trainId }),
        refetchInterval: getRefetchInterval,
    });

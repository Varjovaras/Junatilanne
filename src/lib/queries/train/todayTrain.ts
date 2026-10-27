import { queryOptions } from "@tanstack/react-query";
import { formatDateForUrl, todayISOString } from "../../utils/dateUtils";
import { queryKeys } from "../shared/queryKeys";
import { fetchTrainByDateData } from "./server";

export const TODAY_TRAIN_STALE_TIME_MS = 300_000;

export const todayTrainQueryOptions = (trainNumber: string) => {
    const todayTrainId = `${trainNumber}-${formatDateForUrl(todayISOString())}`;

    return queryOptions({
        queryKey: queryKeys.todayTrain(todayTrainId),
        queryFn: () => fetchTrainByDateData({ data: todayTrainId }),
        staleTime: TODAY_TRAIN_STALE_TIME_MS,
    });
};

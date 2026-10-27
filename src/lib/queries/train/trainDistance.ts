import { queryOptions } from "@tanstack/react-query";
import type { TrainType } from "../../types/trainTypes";
import { getTrainId } from "../../utils/trainDisplay";
import { queryKeys } from "../shared/queryKeys";
import { fetchTrainDistances } from "./server";
import { TRAIN_DETAILS_REFETCH_INTERVAL_MS } from "./trainDetails";

export const trainDistanceQueryOptions = (train: TrainType) => {
    const locationTimestamp = train.trainLocations[0]?.timestamp ?? "none";

    return queryOptions({
        queryKey: queryKeys.trainDistance(String(train.trainNumber), locationTimestamp),
        // Distances are precomputed on the server (shared graph + segment cache)
        // and cached per train, so the browser never downloads or builds the
        // railway network itself.
        queryFn: () => fetchTrainDistances({ data: getTrainId(train) }),
        staleTime: TRAIN_DETAILS_REFETCH_INTERVAL_MS,
    });
};

import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../shared/queryKeys";
import { fetchMapTrains } from "./server";

const MAP_REFETCH_INTERVAL_MS = 10_000;

export const mapTrainsQueryOptions = () =>
    queryOptions({
        queryKey: queryKeys.mapTrains,
        queryFn: () => fetchMapTrains(),
        refetchInterval: MAP_REFETCH_INTERVAL_MS,
        select: (trains) =>
            trains.filter((train) => train.trainLocations && train.trainLocations.length > 0),
    });

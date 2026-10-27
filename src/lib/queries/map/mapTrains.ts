import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../shared/queryKeys";
import { getMapData } from "./getMapData";

const MAP_REFETCH_INTERVAL_MS = 10_000;

export const mapTrainsQueryOptions = () =>
    queryOptions({
        queryKey: queryKeys.mapTrains,
        queryFn: ({ signal }) => getMapData({ signal }),
        refetchInterval: MAP_REFETCH_INTERVAL_MS,
        select: (response) =>
            response.data.currentlyRunningTrains.filter(
                (train) => train.trainLocations && train.trainLocations.length > 0,
            ),
    });

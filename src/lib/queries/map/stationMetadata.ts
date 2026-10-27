import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../shared/queryKeys";
import { fetchStationMetadata } from "./server";

const STATION_METADATA_STALE_TIME_MS = 86_400_000;

export const stationMetadataQueryOptions = () =>
    queryOptions({
        queryKey: queryKeys.stationMetadata,
        queryFn: () => fetchStationMetadata(),
        staleTime: STATION_METADATA_STALE_TIME_MS,
    });

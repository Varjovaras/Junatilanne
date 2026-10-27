import { queryOptions } from "@tanstack/react-query";
import { normalizeStationId, queryKeys } from "../shared/queryKeys";
import { fetchStationMessages } from "./server";

export const stationMessagesQueryOptions = (stationId: string) => {
    const normalizedStationId = normalizeStationId(stationId);

    return queryOptions({
        queryKey: queryKeys.stationMessages(normalizedStationId),
        queryFn: () => fetchStationMessages({ data: normalizedStationId }),
    });
};

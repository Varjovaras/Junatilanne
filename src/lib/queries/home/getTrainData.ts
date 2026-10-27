import type { CurrentlyRunningTrainResponse } from "../../types/trainTypes";
import { graphqlFetch } from "../shared/graphqlClient";
import { getPassengerQuery } from "./passengerQuery";

export const getTrainData = async ({
    signal,
}: { signal?: AbortSignal } = {}): Promise<CurrentlyRunningTrainResponse> => {
    return graphqlFetch<CurrentlyRunningTrainResponse>(getPassengerQuery(), { signal });
};

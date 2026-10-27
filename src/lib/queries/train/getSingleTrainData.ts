import type { SingleTrainResponse } from "../../types/trainTypes";
import { graphqlFetch } from "../shared/graphqlClient";
import { getSingleTrainQuery } from "./singleTrainQuery";

export const getSingleTrainData = async (
    trainNumber: string,
    { signal }: { signal?: AbortSignal } = {},
): Promise<SingleTrainResponse> => {
    if (Number.isNaN(Number(trainNumber))) {
        throw new Error("Not a valid train number");
    }

    const trainResponse = await graphqlFetch<SingleTrainResponse>(
        getSingleTrainQuery(trainNumber),
        { signal },
    );

    if (trainResponse.data.currentlyRunningTrains.length > 1) {
        throw new Error("Got multiple trains from singleTrainQuery");
    }

    if (trainResponse.data.currentlyRunningTrains.length === 0) {
        throw new Error(`No train found currently running for number ${trainNumber}`);
    }

    return trainResponse;
};

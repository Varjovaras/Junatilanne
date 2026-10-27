import type { DifferentDayTrainResponse, TrainType } from "../../types/trainTypes";
import { getDifferentDateTrain } from "./differentDateQuery";
import { graphqlFetch } from "../shared/graphqlClient";

export const getTrainByDateData = async (
    trainId: string,
    { signal }: { signal?: AbortSignal } = {},
): Promise<TrainType | null> => {
    const data = await graphqlFetch<DifferentDayTrainResponse>(getDifferentDateTrain(trainId), {
        signal,
    });
    return data.data.train[0] ?? null;
};

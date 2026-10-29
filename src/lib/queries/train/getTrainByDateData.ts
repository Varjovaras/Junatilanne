import type { DifferentDayTrainResponse, TrainType } from "../../types/trainTypes";
import { getDifferentDateTrain } from "./differentDateQuery";
import { graphqlFetch } from "../shared/graphqlClient";

export const getTrainByDateData = async (
    trainId: string,
    { signal }: { signal?: AbortSignal } = {},
): Promise<TrainType | null> => {
    const { query, variables } = getDifferentDateTrain(trainId);
    const data = await graphqlFetch<DifferentDayTrainResponse>(query, { signal, variables });
    return data.train[0] ?? null;
};

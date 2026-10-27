import { queryOptions } from "@tanstack/react-query";
import type { TrainType } from "../../types/trainTypes";
import { isValidTrainId } from "../../utils/urlUtils";
import { queryKeys } from "../shared/queryKeys";
import { fetchSingleTrainData, fetchTrainByDateData } from "./server";
import { todayTrainQueryOptions } from "./todayTrain";

export const TRAIN_DETAILS_REFETCH_INTERVAL_MS = 60_000;

type TrainDetailsQueryData = {
    kind: "invalid" | "date" | "live";
    train: TrainType | null;
};

export const trainDetailsQueryOptions = (trainId: string) =>
    queryOptions({
        queryKey: queryKeys.trainDetails(trainId),
        queryFn: async ({ client }): Promise<TrainDetailsQueryData> => {
            if (trainId.includes("-")) {
                if (!isValidTrainId(trainId)) {
                    return { kind: "invalid", train: null };
                }

                return {
                    kind: "date",
                    train: await fetchTrainByDateData({ data: trainId }),
                };
            }

            let liveTrain: TrainType | null = null;

            try {
                const response = await fetchSingleTrainData({ data: trainId });
                liveTrain = response.data.currentlyRunningTrains[0] ?? null;
            } catch {
                liveTrain = null;
            }

            if (liveTrain) {
                return { kind: "live", train: liveTrain };
            }

            return {
                kind: "live",
                train: await client.fetchQuery(todayTrainQueryOptions(trainId)),
            };
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.kind !== "live" || !data.train?.runningCurrently) {
                return false;
            }
            return TRAIN_DETAILS_REFETCH_INTERVAL_MS;
        },
    });

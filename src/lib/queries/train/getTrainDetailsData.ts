import type { TrainType } from "../../types/trainTypes";
import { isValidDatedTrainId, isValidTrainNumber } from "@/lib/train/id";
import { todayInHelsinki } from "@/lib/utils/date";
import type { TrainDetailsData } from "./trainDataTypes";
import { getCachedSingleTrain } from "./getCachedSingleTrain";
import { getCachedTrainByDate } from "./getCachedTrainByDate";

export const getTrainDetailsData = async (trainId: string): Promise<TrainDetailsData> => {
    if (trainId.includes("-")) {
        if (!isValidDatedTrainId(trainId)) {
            return { kind: "invalid", train: null };
        }

        return {
            kind: "date",
            train: await getCachedTrainByDate(trainId),
        };
    }

    if (!isValidTrainNumber(trainId)) {
        return { kind: "invalid", train: null };
    }

    let liveTrain: TrainType | null = null;

    try {
        const response = await getCachedSingleTrain(trainId);
        liveTrain = response.currentlyRunningTrains[0] ?? null;
    } catch {
        liveTrain = null;
    }

    if (liveTrain) {
        return { kind: "live", train: liveTrain };
    }

    return {
        kind: "live",
        train: await getCachedTrainByDate(`${trainId}-${todayInHelsinki()}`),
    };
};

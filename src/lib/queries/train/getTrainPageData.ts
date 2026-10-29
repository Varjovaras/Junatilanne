import type { TrainPageData } from "./trainDataTypes";
import { getTrainDetailsData } from "./getTrainDetailsData";
import { getTrackDistancesForTrain } from "./getCachedTrainDistances";

// Resolves the train once and measures distance from that same train, so a
// live detail page does not fetch both the live train and today's dated train.
export const getTrainPageData = async (trainId: string): Promise<TrainPageData> => {
    const details = await getTrainDetailsData(trainId);

    if (!details.train) {
        return { ...details, distance: null };
    }

    return {
        ...details,
        distance: await getTrackDistancesForTrain(details.train),
    };
};

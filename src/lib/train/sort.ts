import type { SortOption } from "@/components/features/delay-info/SortSelector";
import type { TrainType } from "@/lib/types/trainTypes";
import { getTrainCurrentDelay } from "@/lib/train/delay";

export const sortTrains = (trains: TrainType[], sortOption: SortOption) => {
    const multiplier = sortOption.direction === "asc" ? 1 : -1;

    if (sortOption.field === "trainNumber") {
        return [...trains].sort((a, b) => (a.trainNumber - b.trainNumber) * multiplier);
    }

    return trains
        .map((train) => ({ train, delay: getTrainCurrentDelay(train) }))
        .sort((a, b) => (a.delay - b.delay) * multiplier)
        .map(({ train }) => train);
};

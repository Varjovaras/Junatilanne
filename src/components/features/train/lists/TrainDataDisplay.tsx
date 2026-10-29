import type { TrainType } from "@/lib/types/trainTypes";
import { filterTrainsByCategory, type TrainCategoryFilter } from "@/lib/train/classification";
import type { SortOption } from "@/lib/train/sort";
import TrainList from "./TrainList";
import TrainTypeSelector from "@/components/common/TrainTypeSelector";

type TrainDataProps = {
    trains: TrainType[];
    selectedCategory: TrainCategoryFilter;
    onCategoryChange: (category: TrainCategoryFilter) => void;
    delayThreshold: number;
    onDelayThresholdChange: (threshold: number) => void;
    sortOption: SortOption;
    onSortChange: (sort: SortOption) => void;
};

const TrainDataDisplay = ({
    trains,
    selectedCategory,
    onCategoryChange,
    delayThreshold,
    onDelayThresholdChange,
    sortOption,
    onSortChange,
}: TrainDataProps) => {
    const filteredTrains = filterTrainsByCategory(trains, selectedCategory);

    return (
        <div className="w-full">
            <TrainTypeSelector
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
            />
            <TrainList
                trains={filteredTrains}
                trainType={
                    selectedCategory === "commuter"
                        ? "commuter"
                        : selectedCategory === "freight"
                          ? "freight"
                          : selectedCategory === "other"
                            ? "other"
                            : "longDistance"
                }
                delayThreshold={delayThreshold}
                onDelayThresholdChange={onDelayThresholdChange}
                sortOption={sortOption}
                onSortChange={onSortChange}
            />
        </div>
    );
};

export default TrainDataDisplay;

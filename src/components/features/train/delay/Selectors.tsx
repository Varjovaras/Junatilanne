import type { SortOption } from "@/lib/train/sort";
import DelayThresholdSelector from "./DelayThresholdSelector";
import SortSelector from "./SortSelector";

type SelectorsProps = {
    delayThreshold: number;
    onDelayThresholdChange: (threshold: number) => void;
    sortOption: SortOption;
    onSortChange: (sort: SortOption) => void;
};

const Selectors = ({
    delayThreshold,
    onDelayThresholdChange,
    sortOption,
    onSortChange,
}: SelectorsProps) => {
    return (
        <div className="flex flex-col gap-4 py-4 p-2">
            <DelayThresholdSelector
                currentThreshold={delayThreshold}
                onThresholdChange={onDelayThresholdChange}
            />
            <SortSelector currentSort={sortOption} onSortChange={onSortChange} />
        </div>
    );
};

export default Selectors;

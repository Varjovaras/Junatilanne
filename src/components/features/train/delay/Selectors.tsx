import type { Dispatch, SetStateAction } from "react";
import DelayThresholdSelector from "./DelayThresholdSelector";
import SortSelector, { type SortOption } from "./SortSelector";

type SelectorsProps = {
    delayThreshold: number;
    setDelayThreshold: Dispatch<SetStateAction<number>>;
    sortOption: SortOption;
    setSortOption: Dispatch<SetStateAction<SortOption>>;
};

const Selectors = ({
    delayThreshold,
    setDelayThreshold,
    sortOption,
    setSortOption,
}: SelectorsProps) => {
    return (
        <div className="flex flex-col gap-4 py-4 p-2">
            <DelayThresholdSelector
                currentThreshold={delayThreshold}
                onThresholdChange={setDelayThreshold}
            />
            <SortSelector currentSort={sortOption} onSortChange={setSortOption} />
        </div>
    );
};

export default Selectors;

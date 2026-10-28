import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainCategoryFilter } from "@/lib/train/classification";

type TrainTypeSelectorProps = {
    selectedCategory: TrainCategoryFilter;
    onCategoryChange: (category: TrainCategoryFilter) => void;
    variant?: "segmented" | "select";
};

const TrainTypeSelector = ({
    selectedCategory,
    onCategoryChange,
    variant = "segmented",
}: TrainTypeSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    const options = [
        { value: "all", label: translations.allTrains },
        { value: "longDistance", label: translations.longDistanceTrains },
        { value: "commuter", label: translations.commuterTrains },
        { value: "freight", label: translations.freightTrains },
        { value: "other", label: translations.otherTrains },
    ] as const;

    if (variant === "select") {
        return (
            <select
                aria-label={translations.selectTrainTypeAria}
                value={selectedCategory}
                onChange={(event) => onCategoryChange(event.target.value as TrainCategoryFilter)}
                className="px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div className={`flex justify-center my-4 px-2 ${isLoading ? "fade-out" : "fade-in"}`}>
            <SegmentedControl
                value={selectedCategory}
                onChange={onCategoryChange}
                options={options}
            />
        </div>
    );
};

export default TrainTypeSelector;

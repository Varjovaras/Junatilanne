import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";

type TrainTypeSelectorProps = {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
};

const TrainTypeSelector = ({ selectedCategory, onCategoryChange }: TrainTypeSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    const options = [
        { value: "all", label: translations.allTrains },
        { value: "longDistance", label: translations.longDistanceTrains },
        { value: "commuter", label: translations.commuterTrains },
        { value: "freight", label: translations.freightTrains },
    ];

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

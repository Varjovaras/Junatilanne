import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";

type ScheduleScopeSelectorProps = {
    showWholeDay: boolean;
    onChange: (showWholeDay: boolean) => void;
};

const ScheduleScopeSelector = ({ showWholeDay, onChange }: ScheduleScopeSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    return (
        <div className={`flex justify-center ${isLoading ? "fade-out" : "fade-in"}`}>
            <SegmentedControl
                value={showWholeDay ? "wholeDay" : "remaining"}
                onChange={(value) => onChange(value === "wholeDay")}
                ariaLabel={translations.schedule}
                options={[
                    { value: "remaining", label: translations.remainingTrains },
                    { value: "wholeDay", label: translations.wholeDay },
                ]}
            />
        </div>
    );
};

export default ScheduleScopeSelector;

import SegmentedControl from "@/components/common/SegmentedControl";
import type { StationRowType } from "@/lib/station/schedule";
import { useTranslations } from "@/lib/i18n/useTranslations";

type ScheduleEventTypeSelectorProps = {
    eventType: StationRowType;
    onChange: (eventType: StationRowType) => void;
};

const ScheduleEventTypeSelector = ({ eventType, onChange }: ScheduleEventTypeSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    return (
        <div className={`flex justify-center ${isLoading ? "fade-out" : "fade-in"}`}>
            <SegmentedControl
                value={eventType}
                onChange={onChange}
                ariaLabel={translations.schedule}
                options={[
                    { value: "ARRIVAL", label: translations.arrivals },
                    { value: "DEPARTURE", label: translations.departures },
                ]}
            />
        </div>
    );
};

export default ScheduleEventTypeSelector;

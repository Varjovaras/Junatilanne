import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";

export type ScheduleView = "arrivals" | "departures" | "schedule";

type ScheduleViewSelectorProps = {
    view: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
    arrivalCount: number;
    departureCount: number;
    scheduleCount: number;
};

const ScheduleViewSelector = ({
    view,
    onViewChange,
    arrivalCount,
    departureCount,
    scheduleCount,
}: ScheduleViewSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    return (
        <div className={`flex justify-center my-4 px-2 ${isLoading ? "fade-out" : "fade-in"}`}>
            <SegmentedControl
                value={view}
                onChange={onViewChange}
                options={[
                    {
                        value: "arrivals",
                        label: `${translations.arrivals} (${arrivalCount})`,
                    },
                    {
                        value: "departures",
                        label: `${translations.departures} (${departureCount})`,
                    },
                    {
                        value: "schedule",
                        label: `${translations.schedule} (${scheduleCount})`,
                    },
                ]}
            />
        </div>
    );
};

export default ScheduleViewSelector;

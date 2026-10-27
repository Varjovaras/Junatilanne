import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";

export type ScheduleView = "upcoming" | "schedule";

type ScheduleViewSelectorProps = {
    view: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
    upcomingCount: number;
    scheduleCount: number;
};

const ScheduleViewSelector = ({
    view,
    onViewChange,
    upcomingCount,
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
                        value: "upcoming",
                        label: `${translations.futureTrains} (${upcomingCount})`,
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

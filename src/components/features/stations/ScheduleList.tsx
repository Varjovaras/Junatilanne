import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import ScheduleTable from "./ScheduleTable";

type ScheduleListProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const ScheduleList = ({ schedules, stationId }: ScheduleListProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            {schedules.length === 0 ? (
                <p className="text-foreground/60 italic">{translations.noUpcomingDepartures}</p>
            ) : (
                <ScheduleTable schedules={schedules} stationId={stationId} />
            )}
        </div>
    );
};

export default ScheduleList;

import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { isToday } from "@/lib/utils/date";
import ScheduleTable from "./ScheduleTable";

type DailyScheduleProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
    isFiltered?: boolean;
    hasDaySchedules?: boolean;
};

const DailySchedule = ({
    schedules,
    stationId,
    date,
    isFiltered = false,
    hasDaySchedules = false,
}: DailyScheduleProps) => {
    const { translations } = useTranslations();

    const emptyMessage =
        isFiltered && hasDaySchedules
            ? translations.noRemainingTrains
            : date && !isToday(date)
              ? translations.noTrainsOnDate
              : translations.noTrainsToday;

    if (schedules.length === 0) {
        return <p className="text-foreground/60 italic">{emptyMessage}</p>;
    }

    return <ScheduleTable schedules={schedules} stationId={stationId} />;
};

export default DailySchedule;

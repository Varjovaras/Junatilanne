import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationScheduleEntry } from "@/lib/station/scheduleFilter";
import type { StationRowType } from "@/lib/station/schedule";
import { isToday } from "@/lib/utils/date";
import ScheduleTable from "./ScheduleTable";

type DailyScheduleProps = {
    entries: StationScheduleEntry[];
    stationId: string;
    eventType: StationRowType;
    date?: string;
    isFiltered?: boolean;
    hasDaySchedules?: boolean;
};

const DailySchedule = ({
    entries,
    stationId,
    eventType,
    date,
    isFiltered = false,
    hasDaySchedules = false,
}: DailyScheduleProps) => {
    const { translations } = useTranslations();
    const isArrival = eventType === "ARRIVAL";

    const emptyMessage =
        isFiltered && hasDaySchedules
            ? isArrival
                ? translations.noRemainingArrivals
                : translations.noRemainingDepartures
            : date && !isToday(date)
              ? isArrival
                  ? translations.noArrivalsOnDate
                  : translations.noDeparturesOnDate
              : isArrival
                ? translations.noArrivalsToday
                : translations.noDeparturesToday;

    if (entries.length === 0) {
        return <p className="text-foreground/60 italic">{emptyMessage}</p>;
    }

    return <ScheduleTable entries={entries} stationId={stationId} />;
};

export default DailySchedule;

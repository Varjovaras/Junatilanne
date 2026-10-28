import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationScheduleEntry } from "@/lib/station/scheduleFilter";
import type { StationRowType } from "@/lib/station/schedule";
import { isToday } from "@/lib/utils/date";
import ScheduleTable from "./ScheduleTable";

type ScheduleListProps = {
    entries: StationScheduleEntry[];
    stationId: string;
    eventType: StationRowType;
    date: string;
};

const ScheduleList = ({ entries, stationId, eventType, date }: ScheduleListProps) => {
    const { translations } = useTranslations();
    const isArrival = eventType === "ARRIVAL";
    const isTodayDate = isToday(date);

    const emptyMessage = isTodayDate
        ? isArrival
            ? translations.noRemainingArrivals
            : translations.noRemainingDepartures
        : isArrival
          ? translations.noArrivalsOnDate
          : translations.noDeparturesOnDate;

    if (entries.length === 0) {
        return <p className="text-foreground/60 italic">{emptyMessage}</p>;
    }

    return <ScheduleTable entries={entries} stationId={stationId} />;
};

export default ScheduleList;

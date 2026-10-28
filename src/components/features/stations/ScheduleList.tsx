import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationScheduleEntry } from "@/lib/station/scheduleFilter";
import type { StationRowType } from "@/lib/station/schedule";
import ScheduleTable from "./ScheduleTable";

type ScheduleListProps = {
    entries: StationScheduleEntry[];
    stationId: string;
    eventType: StationRowType;
};

const ScheduleList = ({ entries, stationId, eventType }: ScheduleListProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            {entries.length === 0 ? (
                <p className="text-foreground/60 italic">
                    {eventType === "ARRIVAL"
                        ? translations.noUpcomingArrivals
                        : translations.noUpcomingDepartures}
                </p>
            ) : (
                <ScheduleTable entries={entries} stationId={stationId} />
            )}
        </div>
    );
};

export default ScheduleList;

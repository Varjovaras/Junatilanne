import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { formatDate, isToday } from "@/lib/utils/dateUtils";
import VirtualScheduleList from "./VirtualScheduleList";

type DailyScheduleProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
};

const DailySchedule = ({ schedules, stationId, date }: DailyScheduleProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            {date && (
                <p className="text-center text-sm text-foreground/60 mb-2">{formatDate(date)}</p>
            )}
            {schedules.length === 0 ? (
                <p className="text-foreground/60 italic">
                    {date && !isToday(date)
                        ? translations.noTrainsOnDate
                        : translations.noTrainsToday}
                </p>
            ) : (
                <VirtualScheduleList schedules={schedules} stationId={stationId} />
            )}
        </div>
    );
};

export default DailySchedule;

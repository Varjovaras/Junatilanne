import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { isToday } from "@/lib/utils/dateUtils";
import { getTrainId } from "@/lib/utils/trainDisplay";
import ScheduleRow from "./ScheduleRow";

type DailyScheduleProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
};

const DailySchedule = ({ schedules, stationId, date }: DailyScheduleProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            {schedules.length === 0 ? (
                <p className="text-foreground/60 italic">
                    {date && !isToday(date)
                        ? translations.noTrainsOnDate
                        : translations.noTrainsToday}
                </p>
            ) : (
                <div className="space-y-2 w-full max-w-3xl mx-auto">
                    {schedules.map((schedule) => (
                        <ScheduleRow
                            key={getTrainId(schedule)}
                            schedule={schedule}
                            stationId={stationId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailySchedule;

import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { getTrainId } from "@/lib/utils/trainDisplay";
import ScheduleRow from "./ScheduleRow";

type DailyScheduleProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const DailySchedule = ({ schedules, stationId }: DailyScheduleProps) => {
    const { translations } = useTranslations();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">
                {translations.todaysSchedule} ({schedules.length})
            </h2>
            {schedules.length === 0 ? (
                <p className="text-foreground/60 italic">{translations.noTrainsToday}</p>
            ) : (
                <div className="space-y-2 w-full">
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

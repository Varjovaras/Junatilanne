import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { getTrainId } from "@/lib/utils/trainDisplay";
import ScheduleCard from "./ScheduleCard";

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map((schedule) => (
                        <ScheduleCard
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

export default ScheduleList;

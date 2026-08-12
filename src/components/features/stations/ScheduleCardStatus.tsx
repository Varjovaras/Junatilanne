import StatusPill from "@/components/common/StatusPill";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { getDateDisplay } from "@/lib/utils/dateUtils";
import { findStationDepartureWithId } from "@/lib/utils/scheduleUtils";
import { findStationArrivalWithId } from "@/lib/utils/trainStations";

type ScheduleCardStatusProps = {
    schedule: StationSchedule;
    stationId: string;
};

const ScheduleCardStatus = ({ schedule, stationId }: ScheduleCardStatusProps) => {
    const { translations } = useTranslations();
    const stationRow =
        findStationDepartureWithId(schedule, stationId) ??
        findStationArrivalWithId(schedule, stationId);

    return (
        <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs text-foreground/60">
                {getDateDisplay(stationRow?.scheduledTime ?? schedule.departureDate, translations)}
            </span>
            <StatusPill
                cancelled={schedule.cancelled}
                runningCurrently={schedule.runningCurrently}
            />
        </div>
    );
};

export default ScheduleCardStatus;

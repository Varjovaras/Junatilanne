import { Link } from "@tanstack/react-router";
import RouteDisplay from "@/components/common/RouteDisplay";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { formatTime } from "@/lib/utils/dateUtils";
import { findStationDepartureWithId } from "@/lib/utils/scheduleUtils";
import { getFormattedStationName } from "@/lib/utils/stationUtils";
import { getScheduleTrainDisplayName, getScheduleTrainLink } from "@/lib/utils/trainDisplay";
import { findStationArrivalWithId, isStationTerminus } from "@/lib/utils/trainStations";
import ScheduleCardStatus from "./ScheduleCardStatus";

type ScheduleRowProps = {
    schedule: StationSchedule;
    stationId: string;
};

const ScheduleRow = ({ schedule, stationId }: ScheduleRowProps) => {
    const { translations } = useTranslations();
    const departureRow = findStationDepartureWithId(schedule, stationId);

    const firstRow = schedule.timeTableRows[0];
    const lastRow = schedule.timeTableRows[schedule.timeTableRows.length - 1];

    const stationRows = schedule.timeTableRows.filter((row) => row.stationShortCode === stationId);
    const arrivesOnly = isStationTerminus(schedule, stationId);
    const track =
        departureRow?.commercialTrack ??
        findStationArrivalWithId(schedule, stationId)?.commercialTrack;

    return (
        <div className="border border-border bg-surface rounded-lg px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
            <div className="min-w-0 lg:w-1/3 space-y-1">
                <Link
                    to={getScheduleTrainLink(schedule)}
                    className="font-bold text-lg hover:underline truncate block"
                >
                    {getScheduleTrainDisplayName(schedule)}
                </Link>
                <RouteDisplay
                    variant="compact"
                    isAirportLine={
                        schedule.commuterLineID === "P" || schedule.commuterLineID === "I"
                    }
                    start={{
                        name: getFormattedStationName(firstRow.stationShortCode),
                        shortCode: firstRow.stationShortCode,
                    }}
                    end={{
                        name: getFormattedStationName(lastRow.stationShortCode),
                        shortCode: lastRow.stationShortCode,
                    }}
                />
                {track && (
                    <p className="text-sm text-foreground/60">
                        {translations.track} {track}
                    </p>
                )}
                {arrivesOnly && (
                    <span className="inline-block w-fit px-2 py-1 rounded-full text-sm bg-blue-500/10 text-blue-500">
                        {translations.arrivesOnly}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {stationRows.map((row) => (
                    <div
                        key={`${row.type}-${row.scheduledTime}`}
                        className="flex items-center gap-1.5"
                    >
                        <span className="text-foreground/60">
                            {row.type === "ARRIVAL" ? translations.arrives : translations.departs}
                        </span>
                        <span className="font-medium">{formatTime(row.scheduledTime)}</span>
                        {row.cancelled ? (
                            <span className="text-red-500">{translations.cancelled}</span>
                        ) : (
                            <>
                                {row.differenceInMinutes > 0 && (
                                    <span className="text-red-500">
                                        +{row.differenceInMinutes}
                                        {translations.minShortened}
                                    </span>
                                )}
                                {row.actualTime && row.differenceInMinutes <= 0 && (
                                    <span className="text-green-500">{translations.onTime}</span>
                                )}
                                {row.liveEstimateTime && !row.actualTime && (
                                    <span className="text-yellow-500">
                                        {translations.estimated} {formatTime(row.liveEstimateTime)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="lg:ml-auto">
                <ScheduleCardStatus schedule={schedule} stationId={stationId} />
            </div>
        </div>
    );
};

export default ScheduleRow;

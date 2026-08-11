import { Link } from "@tanstack/react-router";
import RouteDisplay from "@/components/common/RouteDisplay";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule, StationTimeTableRow } from "@/lib/types/stationTypes";
import { getFormattedStationName, getTrainTypeString } from "@/lib/utils/stationUtils";
import { getScheduleTrainDisplayName, getScheduleTrainLink } from "@/lib/utils/trainDisplay";
import { findStationArrivalWithId, isStationTerminus } from "@/lib/utils/trainStations";

type ScheduleHeaderProps = {
    schedule: StationSchedule;
    departureRow?: StationTimeTableRow;
    stationId: string;
};

const ScheduleCardHeader = ({ schedule, departureRow, stationId }: ScheduleHeaderProps) => {
    const { translations } = useTranslations();

    const firstRow = schedule.timeTableRows[0];
    const lastRow = schedule.timeTableRows[schedule.timeTableRows.length - 1];
    const arrivesOnly = isStationTerminus(schedule, stationId);
    const track =
        departureRow?.commercialTrack ??
        findStationArrivalWithId(schedule, stationId)?.commercialTrack;

    return (
        <div className="flex justify-between items-start min-w-0">
            <div className="space-y-1">
                <Link
                    to={getScheduleTrainLink(schedule)}
                    className="font-bold text-lg hover:underline truncate block"
                >
                    {getScheduleTrainDisplayName(schedule)}
                </Link>

                <p className="text-sm text-foreground/60 truncate">
                    {getTrainTypeString(schedule, translations)}
                    {track && (
                        <span className="ml-2">
                            • {translations.track} {track}
                        </span>
                    )}
                    {arrivesOnly && (
                        <span className="ml-2">
                            • <span className="text-blue-500">{translations.arrivesOnly}</span>
                        </span>
                    )}
                </p>

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
            </div>
        </div>
    );
};

export default ScheduleCardHeader;

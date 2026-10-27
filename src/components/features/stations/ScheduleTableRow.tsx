import { Link } from "@tanstack/react-router";
import RouteDisplay from "@/components/common/RouteDisplay";
import StatusPill from "@/components/common/StatusPill";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule, StationTimeTableRow } from "@/lib/types/stationTypes";
import { formatTime } from "@/lib/utils/date";
import { getFormattedStationName } from "@/lib/station/display";
import { getScheduleTrainDisplayName, getScheduleTrainLink } from "@/lib/train/display";
import { isAirportLine } from "@/lib/train/display";
import { getStationRows, isJourneyCompleted, isStationTerminus } from "@/lib/station/schedule";

export const scheduleTableGridClass =
    "grid grid-cols-[6.75rem_minmax(0,1fr)_auto] items-start gap-x-3 md:grid-cols-[8rem_minmax(7rem,0.8fr)_minmax(0,1.6fr)_4.5rem_8rem] md:items-center md:gap-x-4";

type ScheduleTableRowProps = {
    schedule: StationSchedule;
    stationId: string;
    index: number;
};

const ScheduleTime = ({ row }: { row: StationTimeTableRow }) => {
    const { translations } = useTranslations();

    return (
        <div className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
            <span className="text-xs uppercase tracking-wide text-foreground/60">
                {row.type === "ARRIVAL" ? translations.arrives : translations.departs}
            </span>
            <span className="text-sm font-semibold tabular-nums">
                {formatTime(row.scheduledTime)}
            </span>
            {row.cancelled ? (
                <span className="hidden text-xs text-red-500 md:inline">
                    {translations.cancelled}
                </span>
            ) : (
                <>
                    {row.differenceInMinutes > 0 && (
                        <span className="text-xs text-red-500">
                            +{row.differenceInMinutes}
                            {translations.minShortened}
                        </span>
                    )}
                    {row.actualTime && row.differenceInMinutes <= 0 && (
                        <span className="text-xs text-green-500">{translations.onTime}</span>
                    )}
                    {row.liveEstimateTime && !row.actualTime && (
                        <span className="text-xs text-yellow-500">
                            {translations.estimated} {formatTime(row.liveEstimateTime)}
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

const ScheduleTableRow = ({ schedule, stationId, index }: ScheduleTableRowProps) => {
    const { translations } = useTranslations();

    const firstRow = schedule.timeTableRows[0];
    const lastRow = schedule.timeTableRows[schedule.timeTableRows.length - 1];
    const stationRows = getStationRows(schedule, stationId);
    const arrivalRow = stationRows.find((row) => row.type === "ARRIVAL");
    const departureRow = stationRows.find((row) => row.type === "DEPARTURE");
    const track = departureRow?.commercialTrack || arrivalRow?.commercialTrack;
    const arrivesOnly = isStationTerminus(schedule, stationId);

    const route = (
        <RouteDisplay
            variant="compact"
            isAirportLine={isAirportLine(schedule.commuterLineID)}
            start={{
                name: getFormattedStationName(firstRow.stationShortCode),
                shortCode: firstRow.stationShortCode,
            }}
            end={{
                name: getFormattedStationName(lastRow.stationShortCode),
                shortCode: lastRow.stationShortCode,
            }}
        />
    );

    return (
        <div
            role="row"
            className={`${scheduleTableGridClass} grid-rows-[auto_auto] gap-y-1 border-b border-border-subtle px-3 py-2.5 transition-colors hover:bg-surface-hover/40 md:grid-rows-none md:px-4 ${
                index % 2 === 1 ? "bg-surface-muted/25" : ""
            }`}
        >
            <div role="cell" className="space-y-1">
                {stationRows.map((row) => (
                    <ScheduleTime key={`${row.type}-${row.scheduledTime}`} row={row} />
                ))}
            </div>

            <div role="cell" className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                        to={getScheduleTrainLink(schedule)}
                        className="font-semibold hover:underline"
                    >
                        {getScheduleTrainDisplayName(schedule)}
                    </Link>
                    {arrivesOnly && (
                        <span className="hidden whitespace-nowrap rounded-full bg-blue-500/10 px-1.5 py-0.5 text-xs text-blue-500 md:inline">
                            {translations.arrivesOnly}
                        </span>
                    )}
                </div>
            </div>

            <div role="cell" className="hidden min-w-0 md:block">
                {route}
            </div>

            <div role="cell" className="hidden text-sm text-foreground/70 md:block">
                {track || <span className="text-foreground/40">–</span>}
            </div>

            <div role="cell" className="justify-self-end">
                <StatusPill
                    cancelled={schedule.cancelled}
                    runningCurrently={schedule.runningCurrently}
                    completed={isJourneyCompleted(schedule)}
                    className="px-1.5 py-0.5 text-xs max-[359px]:px-0.5 max-[359px]:text-[10px] md:px-2 md:py-1 md:text-sm"
                />
            </div>

            <div
                role="cell"
                className="col-span-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:hidden"
            >
                <div className="min-w-0">{route}</div>
                {track && (
                    <span className="whitespace-nowrap text-xs text-foreground/60">
                        {translations.track} {track}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ScheduleTableRow;

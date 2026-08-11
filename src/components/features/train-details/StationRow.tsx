import { Link } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TimeTableRow } from "@/lib/types/trainTypes";
import { formatTime } from "@/lib/utils/dateUtils";
import { removeAsema } from "@/lib/utils/stringUtils";
import DelayDisplay from "./DelayDisplay";
import StationIndicator from "./StationIndicator";
import StationTime from "./StationTime";

export type StationStatus = "departure" | "current" | "next" | "future" | "past";

type StationRowProps = {
    station: TimeTableRow;
    status: StationStatus;
    isPassenger: boolean;
};

const StationRow = ({ station, status, isPassenger }: StationRowProps) => {
    const { translations } = useTranslations();

    const scheduledTime = formatTime(station.scheduledTime);
    const actualTime = station.actualTime ? formatTime(station.actualTime) : null;
    const estimatedTime = station.liveEstimateTime
        ? formatTime(station.liveEstimateTime)
        : scheduledTime;

    const delay = station.differenceInMinutes;
    const isLate = delay > 0;

    const stationName = removeAsema(station.station.name);

    const isCurrentStation = status === "current";
    const isNextStation = status === "next";
    const isFutureStation = status === "next" || status === "future";

    const rowClassName = `flex flex-wrap justify-end items-center gap-x-4 gap-y-1 py-2 px-3 rounded-md
    ${isCurrentStation ? "bg-green-500/5" : ""}
    ${isNextStation ? "bg-blue-500/5" : ""}`;

    return (
        <div className={rowClassName}>
            <div className="flex gap-4 items-center grow shrink basis-full sm:basis-auto min-w-0">
                <StationIndicator
                    isCurrentStation={isCurrentStation}
                    isNextStation={isNextStation}
                    isPassenger={isPassenger}
                />
                <Link
                    to="/stations/$id"
                    params={{ id: station.station.shortCode }}
                    className={`truncate shrink hover:underline
            ${!isPassenger ? "text-foreground/40 hover:text-foreground/70" : ""}
            ${isCurrentStation ? "text-green-500 font-bold" : ""}
            ${isNextStation ? "text-blue-500 font-bold" : ""}`}
                >
                    {stationName}
                </Link>
            </div>

            <div className="flex flex-col items-end gap-1 text-sm shrink-0 sm:min-w-[200px]">
                <StationTime
                    label={translations.scheduled}
                    time={scheduledTime}
                    colorClassName="text-foreground/60"
                />

                {actualTime && isLate && !isFutureStation && (
                    <StationTime
                        label={translations.actual}
                        time={actualTime}
                        colorClassName="text-red-500"
                    />
                )}

                {isFutureStation && estimatedTime !== scheduledTime && (
                    <StationTime
                        label={translations.estimated}
                        time={estimatedTime}
                        colorClassName="text-yellow-500"
                    />
                )}

                {station.commercialTrack && (
                    <div className="w-full flex justify-end sm:justify-between text-foreground/60">
                        <span className="hidden sm:inline">{translations.track}</span>
                        <span className="font-medium text-foreground/80">
                            {station.commercialTrack}
                        </span>
                    </div>
                )}

                {isLate && <DelayDisplay delay={delay} minShortened={translations.minShortened} />}
            </div>
        </div>
    );
};

export default StationRow;

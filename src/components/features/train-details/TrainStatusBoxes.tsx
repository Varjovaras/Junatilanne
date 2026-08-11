import { useState } from "react";
import { Link } from "@tanstack/react-router";
import DelayReasonCard from "@/components/features/delay-info/DelayReasonCard";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { hasMeaningfulCauseText } from "@/lib/utils/causeUtils";
import { formatTime, getArrivalCountdown } from "@/lib/utils/dateUtils";
import { removeAsema } from "@/lib/utils/stringUtils";
import { useMounted } from "@/lib/utils/useMounted";
import { calculateTrainProgress, getDelayByStation } from "@/lib/utils/trainStations";

type TrainStatusBoxesProps = {
    train: TrainType;
};

const TrainStatusBoxes = ({ train }: TrainStatusBoxesProps) => {
    const { translations } = useTranslations();
    const mounted = useMounted();
    const [showDelayCauses, setShowDelayCauses] = useState(false);
    const progress = calculateTrainProgress(train);

    const lastCompletedStop = progress.lastCompletedStop;
    const nextStop = progress.nextStop;

    const timeTablesWithCauses = train.timeTableRows.filter((row) => {
        if (!row.causes || row.causes.length === 0) return false;
        return row.causes.some(hasMeaningfulCauseText);
    });

    return (
        <div className="bg-surface-muted rounded-lg p-4 my-4">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 bg-red-600 rounded-full shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs opacity-70">{translations.currentLast}</p>
                        <p className="font-semibold text-green-500 break-words">
                            {lastCompletedStop ? (
                                <Link
                                    to="/stations/$id"
                                    params={{ id: lastCompletedStop.station.shortCode }}
                                    className="hover:underline"
                                >
                                    {removeAsema(lastCompletedStop.station.name)}
                                </Link>
                            ) : (
                                translations.notStarted
                            )}
                        </p>
                        {lastCompletedStop && (
                            <p className="text-xs text-foreground/60">
                                {formatTime(lastCompletedStop.scheduledTime)}
                            </p>
                        )}
                    </div>
                </div>
                <span className="text-foreground/60 shrink-0">→</span>
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs opacity-70">{translations.nextStop}</p>
                        <p className="font-semibold text-blue-500 break-words">
                            {nextStop ? (
                                <Link
                                    to="/stations/$id"
                                    params={{ id: nextStop.station.shortCode }}
                                    className="hover:underline"
                                >
                                    {removeAsema(nextStop.station.name)}
                                </Link>
                            ) : (
                                translations.journeyComplete
                            )}
                        </p>
                        {nextStop && (
                            <p className="text-xs text-foreground/60">
                                {formatTime(nextStop.scheduledTime)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {nextStop && (
                <div className="text-sm mt-3">
                    {translations.nextArrival}{" "}
                    <span className="font-semibold">
                        {formatTime(nextStop.liveEstimateTime || nextStop.scheduledTime)}
                    </span>
                    {nextStop.differenceInMinutes > 0 && (
                        <span className="text-red-500 font-bold text-xs ml-1">
                            +{nextStop.differenceInMinutes} min
                        </span>
                    )}
                    <span className="text-xs text-foreground/70 ml-2">
                        {mounted
                            ? getArrivalCountdown(
                                  new Date(nextStop.liveEstimateTime || nextStop.scheduledTime),
                                  translations,
                              )
                            : ""}
                    </span>
                </div>
            )}

            {timeTablesWithCauses.length > 0 && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={() => setShowDelayCauses(!showDelayCauses)}
                        aria-expanded={showDelayCauses}
                        className="p-2 text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
                    >
                        {showDelayCauses
                            ? translations.hideDelayCauses
                            : translations.showDelayCauses}
                    </button>
                    {showDelayCauses && (
                        <div className="space-y-3 mt-4">
                            {timeTablesWithCauses.map((timeTableRow) => (
                                <DelayReasonCard
                                    key={`${timeTableRow.station.shortCode}-${timeTableRow.type}-${timeTableRow.scheduledTime}`}
                                    timeTableRow={timeTableRow}
                                    minutes={getDelayByStation(
                                        timeTablesWithCauses,
                                        timeTableRow.station.name,
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainStatusBoxes;

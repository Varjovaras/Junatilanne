import {
    faChevronDown,
    faCircleArrowRight,
    faClock,
    faDiamondTurnRight,
    faGaugeHigh,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import DelayText from "@/components/common/DelayText";
import RouteDisplay from "@/components/common/RouteDisplay";
import StatusPill from "@/components/common/StatusPill";
import TrainDistance from "@/components/features/train-details/TrainDistance";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { formatTime, getArrivalCountdown } from "@/lib/utils/dateUtils";
import { removeAsema } from "@/lib/utils/stringUtils";
import { getTrainCurrentDelay } from "@/lib/utils/trainDelay";
import { getTrainDisplayName, getTrainLink } from "@/lib/utils/trainDisplay";
import { calculateTrainProgress } from "@/lib/utils/trainStations";
import { useMounted } from "@/lib/utils/useMounted";

type TrainRowProps = {
    train: TrainType;
};

const TrainRow = ({ train }: TrainRowProps) => {
    const { translations } = useTranslations();
    const mounted = useMounted();
    const [expanded, setExpanded] = useState(false);

    const currentDelay = getTrainCurrentDelay(train);
    const progress = calculateTrainProgress(train);

    const firstRow = train.timeTableRows[0];
    const lastRow = train.timeTableRows[train.timeTableRows.length - 1];

    const lastStop = progress.lastCompletedStop;
    const nextStop = progress.nextStop;

    const currentSpeed =
        train.trainLocations && train.trainLocations.length > 0
            ? train.trainLocations[train.trainLocations.length - 1].speed
            : null;

    const track = nextStop?.commercialTrack || lastStop?.commercialTrack || "";
    const nextArrivalTime = nextStop ? nextStop.liveEstimateTime || nextStop.scheduledTime : null;

    const trainName = getTrainDisplayName(train);
    const toggle = () => setExpanded((value) => !value);

    return (
        <div
            className={`border border-border bg-surface rounded-lg overflow-hidden transition-shadow duration-300 ${
                expanded ? "shadow-md" : "hover:shadow-sm"
            }`}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={toggle}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle();
                    }
                }}
                className={`flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 px-4 py-3 cursor-pointer transition-colors duration-200 ${
                    expanded ? "bg-surface-muted/60" : "hover:bg-surface-hover/50"
                }`}
            >
                <div className="min-w-0 lg:w-1/3 space-y-1">
                    <Link
                        to={getTrainLink(train)}
                        onClick={(event) => event.stopPropagation()}
                        className="font-bold text-lg hover:underline"
                    >
                        {trainName}
                    </Link>
                    <div className="flex items-center gap-2 text-sm">
                        <DelayText delay={currentDelay} />
                    </div>
                </div>

                <div className="min-w-0 lg:flex-1 flex justify-center">
                    <RouteDisplay
                        variant="list"
                        isAirportLine={train.commuterLineid === "P" || train.commuterLineid === "I"}
                        start={{
                            name: removeAsema(firstRow.station.name),
                            shortCode: firstRow.station.shortCode,
                            time: formatTime(firstRow.scheduledTime),
                        }}
                        end={{
                            name: removeAsema(lastRow.station.name),
                            shortCode: lastRow.station.shortCode,
                            time: formatTime(lastRow.scheduledTime),
                        }}
                    />
                </div>

                <div className="lg:ml-auto flex items-center gap-3">
                    <StatusPill
                        cancelled={train.cancelled}
                        runningCurrently={train.runningCurrently}
                    />
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            toggle();
                        }}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${trainName}`}
                        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-border hover:bg-surface-hover transition-colors"
                    >
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                expanded ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t border-border pt-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 shrink-0">
                                        <FontAwesomeIcon
                                            icon={faLocationDot}
                                            aria-hidden="true"
                                            className="h-3.5 w-3.5 text-green-500"
                                        />
                                    </span>
                                    <span className="text-xs uppercase tracking-wider text-foreground/60 font-medium">
                                        {translations.currentLast}
                                    </span>
                                </div>
                                <div className="ml-9">
                                    {lastStop ? (
                                        <>
                                            <Link
                                                to="/stations/$id"
                                                params={{ id: lastStop.station.shortCode }}
                                                className="font-semibold text-green-600 hover:underline"
                                            >
                                                {removeAsema(lastStop.station.name)}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/70 mt-1">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon
                                                        icon={faClock}
                                                        aria-hidden="true"
                                                        className="h-3 w-3"
                                                    />
                                                    {formatTime(lastStop.scheduledTime)}
                                                </span>
                                                {lastStop.actualTime &&
                                                    lastStop.differenceInMinutes > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 text-red-500 font-medium">
                                                            <FontAwesomeIcon
                                                                icon={faClock}
                                                                aria-hidden="true"
                                                                className="h-3 w-3"
                                                            />
                                                            {formatTime(lastStop.actualTime)}
                                                        </span>
                                                    )}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-foreground/60">
                                            {translations.notStarted}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 shrink-0">
                                        <FontAwesomeIcon
                                            icon={faCircleArrowRight}
                                            aria-hidden="true"
                                            className="h-3.5 w-3.5 text-blue-500"
                                        />
                                    </span>
                                    <span className="text-xs uppercase tracking-wider text-foreground/60 font-medium">
                                        {translations.nextStop}
                                    </span>
                                </div>
                                <div className="ml-9">
                                    {nextStop ? (
                                        <>
                                            <Link
                                                to="/stations/$id"
                                                params={{ id: nextStop.station.shortCode }}
                                                className="font-semibold text-blue-600 hover:underline"
                                            >
                                                {removeAsema(nextStop.station.name)}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/70 mt-1">
                                                {nextArrivalTime && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FontAwesomeIcon
                                                            icon={faClock}
                                                            aria-hidden="true"
                                                            className="h-3 w-3"
                                                        />
                                                        {formatTime(nextArrivalTime)}
                                                    </span>
                                                )}
                                                {mounted && nextArrivalTime && (
                                                    <span className="text-foreground/60">
                                                        {getArrivalCountdown(
                                                            new Date(nextArrivalTime),
                                                            translations,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {nextStop.differenceInMinutes > 0 && (
                                                <span className="text-red-500 font-bold text-xs mt-1">
                                                    +{nextStop.differenceInMinutes}{" "}
                                                    {translations.minShortened}
                                                </span>
                                            )}
                                            <TrainDistance train={train} align="left" />
                                        </>
                                    ) : lastStop ? (
                                        <span className="text-foreground/60">
                                            {translations.journeyComplete}
                                        </span>
                                    ) : (
                                        <span className="text-foreground/60">
                                            {translations.notStarted}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            {currentSpeed !== null && currentSpeed > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted text-sm">
                                    <FontAwesomeIcon
                                        icon={faGaugeHigh}
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 text-foreground/60"
                                    />
                                    <span className="font-medium">{currentSpeed} km/h</span>
                                </span>
                            )}
                            {track && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted text-sm">
                                    <FontAwesomeIcon
                                        icon={faDiamondTurnRight}
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 text-foreground/60"
                                    />
                                    <span className="font-medium">
                                        {translations.track} {track}
                                    </span>
                                </span>
                            )}
                            <Link
                                to="/trains/$id"
                                params={{ id: String(train.trainNumber) }}
                                className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                            >
                                {translations.additionalInformation}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainRow;

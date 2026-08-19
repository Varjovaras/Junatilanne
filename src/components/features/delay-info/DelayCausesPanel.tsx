import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TimeTableRow } from "@/lib/types/trainTypes";
import { getDelayByStation } from "@/lib/utils/trainStations";
import DelayReasonCard from "./DelayReasonCard";

type DelayCausesPanelProps = {
    timeTablesWithCauses: TimeTableRow[];
    onClose: () => void;
};

const DelayCausesPanel = ({ timeTablesWithCauses, onClose }: DelayCausesPanelProps) => {
    const { translations } = useTranslations();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-label={translations.showDelayCauses}
            className="absolute left-1/2 top-full z-10 mt-2 max-h-[75vh] w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-y-auto bg-surface text-foreground border border-border rounded-md shadow-lg"
        >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                <h2 className="text-lg font-semibold">{translations.delayCauses}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={translations.closeAriaLabel}
                    className="text-foreground/60 hover:text-foreground transition-colors"
                >
                    <FontAwesomeIcon icon={faXmark} aria-hidden="true" className="h-4 w-4" />
                </button>
            </div>
            <div className="divide-y divide-border px-4 py-2">
                {timeTablesWithCauses.map((timeTableRow) => (
                    <DelayReasonCard
                        key={`${timeTableRow.station.shortCode}-${timeTableRow.type}-${timeTableRow.scheduledTime}`}
                        timeTableRow={timeTableRow}
                        minutes={getDelayByStation(timeTablesWithCauses, timeTableRow.station.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DelayCausesPanel;

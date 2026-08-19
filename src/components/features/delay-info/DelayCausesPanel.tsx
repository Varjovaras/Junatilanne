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
        const panel = panelRef.current;
        const wrapper = panel?.parentElement;
        if (!panel || !wrapper) return;

        const positionPanel = () => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const isMobile = window.innerWidth <= 640;
            const width = isMobile
                ? Math.min(384, window.innerWidth - 32)
                : Math.min(448, window.innerWidth - 16);
            panel.style.width = `${width}px`;

            if (isMobile) {
                const top = Math.min(wrapperRect.bottom + 8, window.innerHeight - 72);
                panel.style.top = `${Math.max(8, top)}px`;
                panel.style.left = `${(window.innerWidth - width) / 2}px`;
                return;
            }

            panel.style.top = "";
            const margin = 8;
            const centeredLeft = wrapperRect.left + wrapperRect.width / 2 - width / 2;
            const viewportLeft = Math.max(
                margin,
                Math.min(centeredLeft, window.innerWidth - width - margin),
            );
            panel.style.left = `${viewportLeft - wrapperRect.left}px`;
        };

        positionPanel();
        window.addEventListener("resize", positionPanel);
        return () => {
            window.removeEventListener("resize", positionPanel);
        };
    }, []);

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
            className="fixed z-10 max-h-[60vh] w-[min(24rem,calc(100vw_-_2rem))] overflow-y-auto bg-surface text-foreground border border-border rounded-md shadow-lg sm:absolute sm:top-full sm:mt-2 sm:max-h-[75vh] sm:w-[28rem]"
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

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, type RefObject } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TimeTableRow } from "@/lib/types/trainTypes";
import { getDelayByStation } from "@/lib/utils/trainStations";
import DelayReasonCard from "./DelayReasonCard";

type DelayCausesModalProps = {
    timeTablesWithCauses: TimeTableRow[];
    triggerRef: RefObject<HTMLButtonElement | null>;
    onClose: () => void;
};

const DelayCausesModal = ({ timeTablesWithCauses, triggerRef, onClose }: DelayCausesModalProps) => {
    const { translations } = useTranslations();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        dialog.showModal();

        const positionDialog = () => {
            const trigger = triggerRef.current;
            if (!trigger) return;
            const rect = trigger.getBoundingClientRect();
            const width = dialog.offsetWidth;
            const left = Math.max(
                8,
                Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8),
            );
            dialog.style.left = `${left}px`;
            dialog.style.top = `${rect.bottom + 8}px`;
        };

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === dialog) {
                dialog.close();
            }
        };

        positionDialog();
        window.addEventListener("resize", positionDialog);
        document.addEventListener("click", handleBackdropClick);
        return () => {
            window.removeEventListener("resize", positionDialog);
            document.removeEventListener("click", handleBackdropClick);
        };
    }, [triggerRef, onClose]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            aria-label={translations.showDelayCauses}
            className="fixed m-0 max-h-[80vh] w-[min(28rem,calc(100vw-1.5rem))] overflow-y-auto bg-surface text-foreground border border-border rounded-md shadow-lg backdrop:bg-transparent"
        >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                <h2 className="text-lg font-semibold">{translations.delayCauses}</h2>
                <button
                    type="button"
                    onClick={() => dialogRef.current?.close()}
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
        </dialog>
    );
};

export default DelayCausesModal;

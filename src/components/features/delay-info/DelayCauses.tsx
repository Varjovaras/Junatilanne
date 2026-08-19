import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { hasMeaningfulCauseText } from "@/lib/utils/causeUtils";
import DelayCausesModal from "./DelayCausesModal";

type DelayCausesProps = {
    train: TrainType;
};

const DelayCauses = ({ train }: DelayCausesProps) => {
    const { translations } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const timeTablesWithCauses = train.timeTableRows.filter((row) => {
        if (!row.causes || row.causes.length === 0) return false;
        return row.causes.some(hasMeaningfulCauseText);
    });

    if (timeTablesWithCauses.length === 0) {
        return null;
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className="px-4 py-2 text-sm border border-foreground bg-foreground text-background hover:bg-surface hover:text-foreground rounded-md transition-colors"
            >
                {translations.showDelayCauses}
            </button>
            {isOpen && (
                <DelayCausesModal
                    timeTablesWithCauses={timeTablesWithCauses}
                    triggerRef={buttonRef}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default DelayCauses;

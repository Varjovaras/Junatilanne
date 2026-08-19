import { useState } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { hasMeaningfulCauseText } from "@/lib/utils/causeUtils";
import DelayCausesPanel from "./DelayCausesPanel";

type DelayCausesProps = {
    train: TrainType;
};

const DelayCauses = ({ train }: DelayCausesProps) => {
    const { translations } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);

    const timeTablesWithCauses = train.timeTableRows.filter((row) => {
        if (!row.causes || row.causes.length === 0) return false;
        return row.causes.some(hasMeaningfulCauseText);
    });

    if (timeTablesWithCauses.length === 0) {
        return null;
    }

    return (
        <div className="relative flex-1 sm:flex-none">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className="w-full sm:w-auto inline-flex items-center justify-center text-center h-12 sm:h-auto px-2 sm:px-4 py-2 text-xs sm:text-sm border border-foreground bg-foreground text-background hover:bg-surface hover:text-foreground rounded-md transition-colors"
            >
                <span className="hidden sm:inline">{translations.showDelayCauses}</span>
                <span className="sm:hidden">{translations.showDelayCausesMobile}</span>
            </button>
            {isOpen && (
                <DelayCausesPanel
                    timeTablesWithCauses={timeTablesWithCauses}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default DelayCauses;

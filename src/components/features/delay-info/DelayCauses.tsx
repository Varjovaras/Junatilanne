import { useState } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { hasMeaningfulCauseText } from "@/lib/utils/causeUtils";
import { getDelayByStation } from "@/lib/utils/trainStations";
import DelayReasonCard from "./DelayReasonCard";

type DelayCausesProps = {
    train: TrainType;
};

const DelayCauses = ({ train }: DelayCausesProps) => {
    const { translations } = useTranslations();
    const [showDelayCauses, setShowDelayCauses] = useState(false);

    const timeTablesWithCauses = train.timeTableRows.filter((row) => {
        if (!row.causes || row.causes.length === 0) return false;
        return row.causes.some(hasMeaningfulCauseText);
    });

    if (timeTablesWithCauses.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mt-3 md:flex md:justify-center">
                <button
                    type="button"
                    onClick={() => setShowDelayCauses(!showDelayCauses)}
                    aria-expanded={showDelayCauses}
                    className="p-2 text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
                >
                    {showDelayCauses ? translations.hideDelayCauses : translations.showDelayCauses}
                </button>
            </div>
            {showDelayCauses && (
                <div className="mt-4 w-full border border-border bg-surface rounded-lg p-4">
                    <div className="divide-y divide-border">
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
                </div>
            )}
        </>
    );
};

export default DelayCauses;

import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TimeTableRow } from "@/lib/types/trainTypes";
import { getDelayColorClass } from "@/lib/utils/trainDelay";
import { getCauseKey, hasMeaningfulCauseText } from "@/lib/utils/causeUtils";
import CauseItem from "./DelayDetailRow";

type DelayReasonCardProps = {
    timeTableRow: TimeTableRow;
    minutes: number | undefined;
};

const DelayReasonCard = ({ timeTableRow, minutes }: DelayReasonCardProps) => {
    const { translations } = useTranslations();
    const delayColorClass = minutes ? getDelayColorClass(minutes) : "text-gray-500";
    return (
        <div className="bg-surface-muted rounded-lg p-4 min-w-0">
            <div className="mb-2 break-words">
                <span className="font-semibold text-red-500">{translations.station} </span>
                {timeTableRow.station.name}
            </div>
            {timeTableRow.causes?.map((cause) =>
                hasMeaningfulCauseText(cause) ? (
                    <div key={getCauseKey(cause)} className="ml-4 space-y-1 min-w-0">
                        {cause.categoryCode?.name?.trim() && (
                            <CauseItem
                                label={translations.category}
                                value={cause.categoryCode.name}
                            />
                        )}
                        {cause.detailedCategoryCode?.name?.trim() && (
                            <CauseItem
                                label={translations.details}
                                value={cause.detailedCategoryCode.name}
                            />
                        )}
                        {cause.thirdCategoryCode?.name?.trim() && (
                            <CauseItem
                                label={translations.additionalInfo}
                                value={cause.thirdCategoryCode.name}
                            />
                        )}
                    </div>
                ) : null,
            )}
            {minutes ? (
                <p className={`px-4 py-2 text-sm ${delayColorClass}`}>
                    {"+"}
                    {minutes} {translations.minutes}
                </p>
            ) : null}
        </div>
    );
};

export default DelayReasonCard;

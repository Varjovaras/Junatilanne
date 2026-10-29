import { useTranslations } from "@/lib/i18n/useTranslations";
import { DELAY_THRESHOLDS } from "@/lib/train/delay";

const DelayOptions = () => {
    const { translations } = useTranslations();
    return (
        <>
            {DELAY_THRESHOLDS.map((threshold) => (
                <option key={threshold} value={threshold}>
                    {threshold === 0
                        ? translations.allTrains
                        : `${threshold} ${translations.minShortened}`}
                </option>
            ))}
        </>
    );
};

export default DelayOptions;

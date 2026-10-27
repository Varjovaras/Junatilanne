import { useTranslations } from "@/lib/i18n/useTranslations";
import { getDelayColorClass } from "@/lib/train/delay";

type DelayTextProps = {
    delay: number;
};

const DelayText = ({ delay }: DelayTextProps) => {
    const { translations } = useTranslations();

    if (delay > 0) {
        return (
            <span>
                <span className={`${getDelayColorClass(delay)} font-bold`}>{delay}</span>{" "}
                <span className="text-foreground/60">{translations.minutesLate}</span>
            </span>
        );
    }

    return <span className="text-green-500">{translations.onTime}</span>;
};

export default DelayText;

import { getDelayColorClass } from "@/lib/train/delay";

type DelayDisplayProps = {
    delay: number;
    minShortened: string;
};

const DelayDisplay = ({ delay, minShortened }: DelayDisplayProps) => {
    const colorClass = getDelayColorClass(delay);

    return (
        <div className={`w-full flex justify-end ${colorClass}`}>
            +{delay} {minShortened}
        </div>
    );
};

export default DelayDisplay;

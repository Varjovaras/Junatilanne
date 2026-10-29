import DelayThresholdSelector from "@/components/features/train/delay/DelayThresholdSelector";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { getNoTrainsMessage, type TrainTypeFilter } from "./trainTypeMessages";

type NoTrainsProps = {
    trainType: TrainTypeFilter;
    delayThreshold: number;
    onDelayThresholdChange: (threshold: number) => void;
};

const NoTrains = ({ trainType, delayThreshold, onDelayThresholdChange }: NoTrainsProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            <DelayThresholdSelector
                currentThreshold={delayThreshold}
                onThresholdChange={onDelayThresholdChange}
            />
            <h2 className="text-xl font-bold p-2 text-green-500">
                {getNoTrainsMessage(trainType, translations)}
            </h2>
        </div>
    );
};

export default NoTrains;

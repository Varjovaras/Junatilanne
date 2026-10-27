import type { Dispatch, SetStateAction } from "react";
import DelayThresholdSelector from "@/components/features/train/delay/DelayThresholdSelector";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { getNoTrainsMessage, type TrainTypeFilter } from "./trainTypeMessages";

type NoTrainsProps = {
    trainType: TrainTypeFilter;
    delayThreshold: number;
    setDelayThreshold: Dispatch<SetStateAction<number>>;
};

const NoTrains = ({ trainType, delayThreshold, setDelayThreshold }: NoTrainsProps) => {
    const { translations } = useTranslations();

    return (
        <div>
            <DelayThresholdSelector
                currentThreshold={delayThreshold}
                onThresholdChange={setDelayThreshold}
            />
            <h2 className="text-xl font-bold p-2 text-green-500">
                {getNoTrainsMessage(trainType, translations)}
            </h2>
        </div>
    );
};

export default NoTrains;

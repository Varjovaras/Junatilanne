import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import TrainChip from "./TrainChip";

type TrainSpeedProps = {
    train: TrainType;
    chip?: boolean;
};

const TrainSpeed = ({ train, chip = false }: TrainSpeedProps) => {
    const { translations } = useTranslations();
    const currentSpeed =
        train.trainLocations && train.trainLocations.length > 0
            ? train.trainLocations[train.trainLocations.length - 1].speed
            : null;

    if (currentSpeed === null || currentSpeed <= 0) return null;

    if (chip) {
        return (
            <TrainChip icon={faGaugeHigh}>
                <span className="font-medium">
                    {currentSpeed} {translations.speedUnit}
                </span>
            </TrainChip>
        );
    }

    return (
        <div>
            <p className="text-xs text-foreground/70">
                {currentSpeed} {translations.speedUnit}
            </p>
        </div>
    );
};

export default TrainSpeed;

import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import type { TrainType } from "@/lib/types/trainTypes";
import TrainChip from "./TrainChip";

type TrainSpeedProps = {
    train: TrainType;
    chip?: boolean;
};

const TrainSpeed = ({ train, chip = false }: TrainSpeedProps) => {
    const currentSpeed =
        train.trainLocations && train.trainLocations.length > 0
            ? train.trainLocations[train.trainLocations.length - 1].speed
            : null;

    if (currentSpeed === null || currentSpeed <= 0) return null;

    if (chip) {
        return (
            <TrainChip icon={faGaugeHigh}>
                <span className="font-medium">{currentSpeed} km/h</span>
            </TrainChip>
        );
    }

    return (
        <div>
            <p className="text-xs text-foreground/70">{currentSpeed} km/h</p>
        </div>
    );
};

export default TrainSpeed;

import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TrainType } from "@/lib/types/trainTypes";

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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted text-sm">
                <FontAwesomeIcon
                    icon={faGaugeHigh}
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-foreground/60"
                />
                <span className="font-medium">{currentSpeed} km/h</span>
            </span>
        );
    }

    return (
        <div>
            <p className="text-xs text-foreground/70">{currentSpeed} km/h</p>
        </div>
    );
};

export default TrainSpeed;

import {
    faCircleArrowRight,
    faLocationDot,
    faPersonWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type StationIndicatorProps = {
    isCurrentStation: boolean;
    isNextStation: boolean;
    isPassenger: boolean;
};

const StationIndicator = ({
    isCurrentStation,
    isNextStation,
    isPassenger,
}: StationIndicatorProps) => (
    <div className="w-6 text-center shrink-0">
        {isCurrentStation && (
            <FontAwesomeIcon
                icon={faLocationDot}
                aria-hidden="true"
                className="h-4 w-4 text-green-600"
            />
        )}
        {isNextStation && (
            <FontAwesomeIcon
                icon={faCircleArrowRight}
                aria-hidden="true"
                className="h-4 w-4 text-blue-600"
            />
        )}
        {isPassenger && !isCurrentStation && !isNextStation && (
            <FontAwesomeIcon
                icon={faPersonWalking}
                aria-hidden="true"
                className="h-4 w-4 text-foreground/50"
            />
        )}
    </div>
);

export default StationIndicator;

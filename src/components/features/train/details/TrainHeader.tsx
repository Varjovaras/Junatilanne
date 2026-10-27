import { faClock } from "@fortawesome/free-solid-svg-icons";
import DelayText from "@/components/common/DelayText";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { formatDate, isToday } from "@/lib/utils/date";
import { getTrainCurrentDelay } from "@/lib/train/delay";
import { getTrainDisplayName } from "@/lib/train/display";
import TrainChip from "../shared/TrainChip";
import TrainDistance from "../shared/TrainDistance";
import TrainRoute from "../shared/TrainRoute";
import TrainSpeed from "../shared/TrainSpeed";

type TrainHeaderProps = {
    train: TrainType;
};
const TrainHeader = ({ train }: TrainHeaderProps) => {
    const { translations } = useTranslations();

    const currentTimeDiff = getTrainCurrentDelay(train);

    return (
        <div className="mb-4 text-center mt-2 flex flex-col items-center">
            <div className="mb-2">
                <p className="text-4xl font-bold">{getTrainDisplayName(train)}</p>
                <p className="p-2">
                    {isToday(train.departureDate)
                        ? translations.today
                        : formatDate(train.departureDate)}
                </p>
            </div>
            <TrainRoute train={train} variant="details" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <TrainChip icon={faClock}>
                    <DelayText delay={currentTimeDiff} />
                </TrainChip>
                <TrainSpeed train={train} chip />
                <TrainDistance train={train} chip />
            </div>
        </div>
    );
};

export default TrainHeader;

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { trainDetailsQueryOptions } from "@/lib/queries/train/trainDetails";
import type { MapTrain } from "@/lib/types/trainTypes";
import { getTrainCurrentDelay } from "@/lib/utils/trainDelay";
import { getTrainDisplayName } from "@/lib/utils/trainDisplay";
import { getLatestVisitedStationName, getNextCommercialStation } from "@/lib/utils/trainStations";

type TrainPopupContentProps = {
    train: MapTrain;
};

const TrainPopupContent = ({ train }: TrainPopupContentProps) => {
    const { translations } = useTranslations();
    const { data: trainDetails, isPending } = useQuery(
        trainDetailsQueryOptions(String(train.trainNumber)),
    );
    const detailedTrain = trainDetails?.train;
    const speed = detailedTrain?.trainLocations[0]?.speed ?? train.trainLocations[0]?.speed;
    const currentStation = detailedTrain ? getLatestVisitedStationName(detailedTrain) : null;
    const nextStation = detailedTrain
        ? getNextCommercialStation(detailedTrain)?.station.name
        : null;
    const delay = detailedTrain ? getTrainCurrentDelay(detailedTrain) : undefined;

    return (
        <div className="min-w-[180px]">
            <Link
                to="/trains/$id"
                params={{ id: String(train.trainNumber) }}
                className="block text-lg font-bold text-foreground transition-colors hover:text-red-500"
            >
                {getTrainDisplayName(train)}
            </Link>
            <div className="mt-2 space-y-1 text-sm text-foreground/70">
                <p>
                    {translations.currentSpeed}:{" "}
                    <span className="font-medium text-foreground">
                        {speed === undefined ? translations.noCurrentSpeed : `${speed} km/h`}
                    </span>
                </p>
                <p>{train.trainType.trainCategory?.name || train.trainType.name}</p>
                {isPending && <p>{translations.mapLoading}</p>}
                {currentStation && (
                    <p>
                        {translations.latestStation} {currentStation}
                    </p>
                )}
                {nextStation && (
                    <p>
                        {translations.nextStation} {nextStation}
                    </p>
                )}
                {delay !== undefined && (
                    <p>
                        {translations.delay}:{" "}
                        {delay === 0
                            ? translations.onTime
                            : `${delay} ${translations.minShortened}`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TrainPopupContent;

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { trainDistanceQueryOptions } from "@/lib/queries/queryOptions";
import type { TrainType } from "@/lib/types/trainTypes";
import { removeAsema } from "@/lib/utils/stringUtils";
import { getCommercialStations, getNextCommercialStation } from "@/lib/utils/trainStations";

type TrainDistanceProps = {
    train: TrainType;
    align?: "center" | "left";
};

const formatKilometers = (kilometers: number): string =>
    kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers).toString();

const TrainDistance = ({ train, align = "center" }: TrainDistanceProps) => {
    const { translations } = useTranslations();
    const { data } = useQuery(trainDistanceQueryOptions(train));

    if (!data) return null;

    const nextStation = getNextCommercialStation(train);
    const commercialArrivals = getCommercialStations(train.timeTableRows, "ARRIVAL");
    const destination = commercialArrivals[commercialArrivals.length - 1];

    return (
        <div
            className={`mt-1.5 flex flex-col gap-1 text-sm text-foreground/80 ${
                align === "left" ? "items-start text-left" : "items-center"
            }`}
        >
            {nextStation && (
                <p>
                    {translations.kmToNextStation
                        .replace("{n}", formatKilometers(data.toNextStationKm))
                        .replace("{station}", removeAsema(nextStation.station.name))}
                </p>
            )}
            {destination && destination.station.shortCode !== nextStation?.station.shortCode && (
                <p>
                    {translations.remainingToDestination
                        .replace("{n}", formatKilometers(data.toDestinationKm))
                        .replace("{station}", removeAsema(destination.station.name))}
                </p>
            )}
        </div>
    );
};

export default TrainDistance;

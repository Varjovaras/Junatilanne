import { faLocationDot, faRoute } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { trainDistanceQueryOptions } from "@/lib/queries/train/trainDistance";
import type { TrainType } from "@/lib/types/trainTypes";
import { removeAsema } from "@/lib/utils/string";
import { getCommercialStations, getNextCommercialStation } from "@/lib/train/progress";
import TrainChip from "./TrainChip";

type TrainDistanceProps = {
    train: TrainType;
    align?: "center" | "left";
    chip?: boolean;
    // When false the distance query is not run; used to keep collapsed rows on
    // the homepage from computing distances until they are expanded.
    enabled?: boolean;
};

const formatKilometers = (kilometers: number): string =>
    kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers).toString();

const TrainDistance = ({
    train,
    align = "center",
    chip = false,
    enabled = true,
}: TrainDistanceProps) => {
    const { translations } = useTranslations();
    const { data } = useQuery({ ...trainDistanceQueryOptions(train), enabled });

    if (!data) return null;

    // The station a distance refers to comes from the distance calculation, so
    // the label always matches the measurement even when the train is ahead of
    // the timetable.
    const nextStation =
        train.timeTableRows.find((row) => row.station.shortCode === data.nextStationShortCode) ??
        getNextCommercialStation(train);
    const destination =
        train.timeTableRows.find((row) => row.station.shortCode === data.destinationShortCode) ??
        getCommercialStations(train.timeTableRows, "ARRIVAL").at(-1);

    const nextStationText = nextStation
        ? translations.kmToNextStation
              .replace("{n}", formatKilometers(data.toNextStationKm))
              .replace("{station}", removeAsema(nextStation.station.name))
        : null;

    const destinationText =
        destination && destination.station.shortCode !== nextStation?.station.shortCode
            ? translations.remainingToDestination
                  .replace("{n}", formatKilometers(data.toDestinationKm))
                  .replace("{station}", removeAsema(destination.station.name))
            : null;

    if (chip) {
        return (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {nextStationText && <TrainChip icon={faLocationDot}>{nextStationText}</TrainChip>}
                {destinationText && <TrainChip icon={faRoute}>{destinationText}</TrainChip>}
            </div>
        );
    }

    return (
        <div
            className={`mt-1.5 flex flex-col gap-1 text-sm text-foreground/80 ${
                align === "left" ? "items-start text-left" : "items-center"
            }`}
        >
            {nextStationText && <p>{nextStationText}</p>}
            {destinationText && <p>{destinationText}</p>}
        </div>
    );
};

export default TrainDistance;

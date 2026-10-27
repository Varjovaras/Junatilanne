import RouteDisplay from "@/components/common/RouteDisplay";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { formatTime } from "@/lib/utils/date";
import { removeAsema } from "@/lib/utils/string";
import { isAirportLine } from "@/lib/train/display";
import { getAirportStop } from "@/lib/train/progress";

type TrainRouteProps = {
    train: TrainType;
    variant: "list" | "details";
};

const TrainRoute = ({ train, variant }: TrainRouteProps) => {
    const { translations } = useTranslations();

    const firstRow = train.timeTableRows[0];
    const lastRow = train.timeTableRows[train.timeTableRows.length - 1];
    const airportStop = getAirportStop(train);

    return (
        <RouteDisplay
            variant={variant}
            isAirportLine={isAirportLine(train.commuterLineid)}
            start={{
                name: removeAsema(firstRow.station.name),
                shortCode: firstRow.station.shortCode,
                time: formatTime(firstRow.scheduledTime),
            }}
            airport={{
                name: translations.airport,
                shortCode: "LEN",
                time: airportStop ? formatTime(airportStop.scheduledTime) : undefined,
            }}
            end={{
                name: removeAsema(lastRow.station.name),
                shortCode: lastRow.station.shortCode,
                time: formatTime(lastRow.scheduledTime),
            }}
        />
    );
};

export default TrainRoute;

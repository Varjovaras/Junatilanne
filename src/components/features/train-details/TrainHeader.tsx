import RouteDisplay from "@/components/common/RouteDisplay";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { formatDate, formatTime, isToday } from "@/lib/utils/dateUtils";
import { removeAsema } from "@/lib/utils/stringUtils";
import { getTrainDisplayName } from "@/lib/utils/trainDisplay";
import { getAirportStop } from "@/lib/utils/trainStations";

type TrainHeaderProps = {
    train: TrainType;
};
const TrainHeader = ({ train }: TrainHeaderProps) => {
    const { translations } = useTranslations();

    const firstRow = train.timeTableRows[0];
    const lastRow = train.timeTableRows[train.timeTableRows.length - 1];
    const airportStop = getAirportStop(train);

    return (
        <div className="mb-8 text-center mt-2">
            <div className="mb-2">
                <p className="text-4xl font-bold">{getTrainDisplayName(train)}</p>
                <p className="p-2">
                    {isToday(train.departureDate.toString())
                        ? translations.today
                        : formatDate(train.departureDate)}
                </p>
            </div>
            <RouteDisplay
                variant="details"
                isAirportLine={train.commuterLineid === "P" || train.commuterLineid === "I"}
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
        </div>
    );
};

export default TrainHeader;

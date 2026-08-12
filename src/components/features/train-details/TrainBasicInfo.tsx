import DelayText from "@/components/common/DelayText";
import RouteDisplay from "@/components/common/RouteDisplay";
import type { TrainType } from "@/lib/types/trainTypes";
import { formatTime } from "@/lib/utils/dateUtils";
import { removeAsema } from "@/lib/utils/stringUtils";
import { getTrainCurrentDelay } from "@/lib/utils/trainDelay";
import TrainDistance from "./TrainDistance";
import TrainSpeed from "./TrainSpeed";

type TrainBasicInfoProps = {
    train: TrainType;
};

const TrainBasicInfo = ({ train }: TrainBasicInfoProps) => {
    const currentTimeDiff = getTrainCurrentDelay(train);

    const firstRow = train.timeTableRows[0];
    const lastRow = train.timeTableRows[train.timeTableRows.length - 1];

    return (
        <div>
            <RouteDisplay
                isAirportLine={train.commuterLineid === "P" || train.commuterLineid === "I"}
                start={{
                    name: removeAsema(firstRow.station.name),
                    shortCode: firstRow.station.shortCode,
                    time: formatTime(firstRow.scheduledTime),
                }}
                end={{
                    name: removeAsema(lastRow.station.name),
                    shortCode: lastRow.station.shortCode,
                    time: formatTime(lastRow.scheduledTime),
                }}
            />
            <div className="text-center mt-2">
                <p>
                    <DelayText delay={currentTimeDiff} />
                </p>
                <TrainSpeed train={train} />
                <TrainDistance train={train} />
            </div>
        </div>
    );
};

export default TrainBasicInfo;

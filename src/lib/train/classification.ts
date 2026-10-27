import type { StationSchedule } from "../types/stationTypes";
import {
    commuterTrainTypeNames,
    freightTrainTypeNames,
    longDistanceTrainTypeNames,
} from "@/lib/data/trainNames";
import type { TrainType } from "../types/trainTypes";

export type TrainGroup = "commuter" | "longDistance" | "freight";

type TrainClassificationInput = {
    commuterLineid: string;
    trainTypeName: string;
    trainCategoryName: string | undefined | null;
};

const classifyTrainType = ({
    commuterLineid,
    trainTypeName,
    trainCategoryName,
}: TrainClassificationInput): TrainGroup | "unknown" => {
    if (commuterLineid !== "") return "commuter";
    if (trainCategoryName === "Commuter") return "commuter";
    if (trainCategoryName === "Long-distance") return "longDistance";
    if (trainCategoryName === "Cargo") return "freight";

    if ((freightTrainTypeNames as readonly string[]).includes(trainTypeName)) return "freight";
    if ((commuterTrainTypeNames as readonly string[]).includes(trainTypeName)) return "commuter";
    if ((longDistanceTrainTypeNames as readonly string[]).includes(trainTypeName)) {
        return "longDistance";
    }

    // Unknown types default to freight so they don't appear in passenger train sections
    return "unknown";
};

export const getTrainCategory = (train: {
    commuterLineid: string;
    trainType: { name: string; trainCategory?: { name?: string } | null };
}): TrainGroup => {
    const category = classifyTrainType({
        commuterLineid: train.commuterLineid,
        trainTypeName: train.trainType.name,
        trainCategoryName: train.trainType.trainCategory?.name,
    });
    return category === "unknown" ? "freight" : category;
};

export const getStationScheduleCategory = (schedule: StationSchedule): TrainGroup => {
    const category = classifyTrainType({
        commuterLineid: schedule.commuterLineID,
        trainTypeName: schedule.trainType,
        trainCategoryName: schedule.trainCategory,
    });
    return category === "unknown" ? "longDistance" : category;
};

export const filterTrainsByCategory = (
    trains: TrainType[],
    category: "all" | TrainGroup,
): TrainType[] => {
    if (category === "all") return trains;

    return trains.filter((train) => {
        const trainCategory = getTrainCategory(train);
        return trainCategory === category;
    });
};

export const filterSchedulesByCategory = (
    schedules: StationSchedule[],
    category: "all" | TrainGroup | "passengerCommuter",
): StationSchedule[] => {
    if (category === "all") return schedules;

    if (category === "passengerCommuter") {
        const passengerTrains = schedules.filter(
            (schedule) => getStationScheduleCategory(schedule) !== "freight",
        );
        return passengerTrains.length > 0 ? passengerTrains : schedules;
    }

    return schedules.filter((schedule) => getStationScheduleCategory(schedule) === category);
};

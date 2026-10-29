import type { StationSchedule } from "../types/stationTypes";
import {
    commuterTrainTypeNames,
    freightTrainTypeNames,
    longDistanceTrainTypeNames,
    otherTrainTypeNames,
} from "@/lib/data/trainNames";
import type { TrainType } from "../types/trainTypes";

export type TrainGroup = "commuter" | "longDistance" | "freight" | "other";
export type TrainCategoryFilter = "all" | TrainGroup;

export const TRAIN_CATEGORY_FILTERS: readonly TrainCategoryFilter[] = [
    "all",
    "longDistance",
    "commuter",
    "freight",
    "other",
];

export const DEFAULT_TRAIN_CATEGORY: TrainCategoryFilter = "longDistance";

export const isTrainCategoryFilter = (value: unknown): value is TrainCategoryFilter =>
    (TRAIN_CATEGORY_FILTERS as readonly unknown[]).includes(value);

type TrainClassificationInput = {
    commuterLineid: string;
    trainTypeName: string;
    trainCategoryName: string | undefined | null;
};

const classifyTrainType = ({
    commuterLineid,
    trainTypeName,
    trainCategoryName,
}: TrainClassificationInput): TrainGroup => {
    if (commuterLineid !== "") return "commuter";

    switch (trainCategoryName) {
        case "Commuter":
            return "commuter";
        case "Long-distance":
            return "longDistance";
        case "Cargo":
            return "freight";
        case "Shunting":
        case "Locomotive":
        case "On-track machines":
        case "Test drive":
            return "other";
    }

    if ((otherTrainTypeNames as readonly string[]).includes(trainTypeName)) return "other";
    if ((freightTrainTypeNames as readonly string[]).includes(trainTypeName)) return "freight";
    if ((commuterTrainTypeNames as readonly string[]).includes(trainTypeName)) return "commuter";
    if ((longDistanceTrainTypeNames as readonly string[]).includes(trainTypeName)) {
        return "longDistance";
    }

    // Unknown types are neither passenger nor cargo trains.
    return "other";
};

export const getTrainCategory = (train: {
    commuterLineid: string;
    trainType: { name: string; trainCategory?: { name?: string } | null };
}): TrainGroup =>
    classifyTrainType({
        commuterLineid: train.commuterLineid,
        trainTypeName: train.trainType.name,
        trainCategoryName: train.trainType.trainCategory?.name,
    });

export const getStationScheduleCategory = (schedule: StationSchedule): TrainGroup =>
    classifyTrainType({
        commuterLineid: schedule.commuterLineID,
        trainTypeName: schedule.trainType,
        trainCategoryName: schedule.trainCategory,
    });

export const filterTrainsByCategory = (
    trains: TrainType[],
    category: TrainCategoryFilter,
): TrainType[] => {
    if (category === "all") return trains;

    return trains.filter((train) => {
        const trainCategory = getTrainCategory(train);
        return trainCategory === category;
    });
};

export const filterSchedulesByCategory = (
    schedules: StationSchedule[],
    category: TrainCategoryFilter,
): StationSchedule[] => {
    if (category === "all") return schedules;

    return schedules.filter((schedule) => getStationScheduleCategory(schedule) === category);
};

export const filterScheduleEntriesByCategory = <T extends { schedule: StationSchedule }>(
    entries: T[],
    category: TrainCategoryFilter,
): T[] => {
    if (category === "all") return entries;

    return entries.filter((entry) => getStationScheduleCategory(entry.schedule) === category);
};

import type { StationSchedule } from "../types/stationTypes";
import type { TrainType } from "../types/trainTypes";
import { isToday } from "@/lib/utils/date";

export const isAirportLine = (commuterLineId: string): boolean =>
    commuterLineId === "P" || commuterLineId === "I";

export const getTrainDisplayName = (
    train: Pick<TrainType, "commuterLineid" | "trainNumber" | "trainType">,
): string => {
    return train.commuterLineid || `${train.trainType.name} ${train.trainNumber}`;
};

const getDatePart = (departureDate: string | Date): string =>
    departureDate instanceof Date
        ? departureDate.toISOString().slice(0, 10)
        : departureDate.slice(0, 10);

export const getTrainLink = (train: TrainType, includeDate = false): string => {
    if (includeDate) {
        return `/trains/${train.trainNumber}-${getDatePart(train.departureDate)}`;
    }
    return `/trains/${train.trainNumber}`;
};

export const getScheduleTrainDisplayName = (schedule: StationSchedule): string => {
    return schedule.commuterLineID || `${schedule.trainType} ${schedule.trainNumber}`;
};

export const getScheduleTrainLink = (schedule: StationSchedule): string => {
    if (schedule.runningCurrently && isToday(schedule.departureDate)) {
        return `/trains/${schedule.trainNumber}`;
    }
    return `/trains/${schedule.trainNumber}-${schedule.departureDate}`;
};

export const getTrainId = (train: {
    trainNumber: number;
    departureDate: string | Date;
}): string => {
    return `${train.trainNumber}-${getDatePart(train.departureDate)}`;
};

import { isValidDate } from "@/lib/utils/date";

const TRAIN_NUMBER_PATTERN = /^\d+$/;
const DATED_TRAIN_ID_PATTERN = /^(\d+)-(\d{4}-\d{2}-\d{2})$/;

export const isValidTrainNumber = (value: unknown): value is string => {
    if (typeof value !== "string" || !TRAIN_NUMBER_PATTERN.test(value)) {
        return false;
    }

    const trainNumberValue = Number(value);

    return Number.isSafeInteger(trainNumberValue) && trainNumberValue > 0;
};

export const isValidDatedTrainId = (value: unknown): value is string => {
    if (typeof value !== "string") return false;

    const match = DATED_TRAIN_ID_PATTERN.exec(value);
    if (!match) return false;

    const [, trainNumber, date] = match;

    return isValidTrainNumber(trainNumber) && isValidDate(date);
};

export const isValidTrainId = (value: unknown): value is string =>
    isValidTrainNumber(value) || isValidDatedTrainId(value);

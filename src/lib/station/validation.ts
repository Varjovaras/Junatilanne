import { isValidDate } from "@/lib/utils/date";
import { isValidStationCodeShape, normalizeStationCode } from "./code";

export type StationScheduleParams = {
    stationId: string;
    date: string;
};

export const validateStationScheduleParams = (value: unknown): StationScheduleParams => {
    if (typeof value !== "object" || value === null) {
        throw new Error("Invalid station schedule parameters");
    }

    const { stationId, date } = value as Record<string, unknown>;

    if (!isValidStationCodeShape(stationId)) {
        throw new Error("Invalid station code");
    }

    if (!isValidDate(date)) {
        throw new Error("Invalid date");
    }

    return {
        stationId: normalizeStationCode(stationId),
        date,
    };
};

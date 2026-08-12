import type { Translations } from "../i18n/translations";
import type { StationSchedule } from "../types/stationTypes";
import { majorStations, type StationCode } from "./majorStations";
import { removeAsema } from "./stringUtils";

export const getStationName = (shortCode: string): string => {
    if (shortCode in majorStations) {
        return majorStations[shortCode as StationCode];
    }
    return shortCode;
};

export const getFormattedStationName = (shortCode: string): string => {
    return removeAsema(getStationName(shortCode));
};

export const getTrainTypeString = (train: StationSchedule, translations: Translations) => {
    switch (train.trainType) {
        case "IC":
            return "Intercity";
        case "S":
            return "Pendolino";
        case "PYO":
            return translations.nightTrain;
        case "HL":
            return translations.commuterTrain;
        default:
            return train.trainCategory || train.trainType;
    }
};

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

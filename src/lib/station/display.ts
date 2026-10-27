import { majorStations, type StationCode } from "@/lib/station/majorStations";
import { removeAsema } from "@/lib/utils/string";

export const getStationName = (shortCode: string): string => {
    if (shortCode in majorStations) {
        return majorStations[shortCode as StationCode];
    }
    return shortCode;
};

export const getFormattedStationName = (shortCode: string): string => {
    return removeAsema(getStationName(shortCode));
};

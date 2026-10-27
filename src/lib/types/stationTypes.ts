import type { Cause } from "./trainTypes";

export type StationMetadataType = "STATION" | "STOPPING_POINT";

export type StationMetadata = {
    countryCode: "FI" | "SE";
    latitude: number;
    longitude: number;
    passengerTraffic: boolean;
    stationName: string;
    stationShortCode: string;
    stationUICCode?: number;
    type: StationMetadataType;
};

export type StationSchedule = {
    trainNumber: number;
    departureDate: string;
    trainType: string;
    trainCategory: string;
    commuterLineID: string;
    runningCurrently: boolean;
    cancelled: boolean;
    timeTableRows: StationTimeTableRow[];
};

export type StationTimeTableRow = {
    stationShortCode: string;
    stationUICCode: number;
    countryCode: string;
    type: "ARRIVAL" | "DEPARTURE";
    trainStopping: boolean;
    commercialStop: boolean;
    commercialTrack: string;
    cancelled: boolean;
    scheduledTime: string;
    actualTime?: string;
    liveEstimateTime?: string;
    differenceInMinutes: number;
    causes: Cause[];
    trainReady?: {
        source: string;
        accepted: boolean;
        timestamp: string;
    };
};

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
    operatorUICCode: number;
    operatorShortCode: string;
    trainType: string;
    trainCategory: string;
    commuterLineID: string;
    runningCurrently: boolean;
    cancelled: boolean;
    version: number;
    timetableType: string;
    timetableAcceptanceDate: string;
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
    estimateSource?: string;
    differenceInMinutes: number;
    // biome-ignore lint/suspicious/noExplicitAny: not sure of all the types digitraffic data returns
    causes: any[];
    trainReady?: {
        source: string;
        accepted: boolean;
        timestamp: string;
    };
};

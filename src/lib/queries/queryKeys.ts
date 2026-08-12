export const normalizeStationId = (stationId: string) => stationId.toUpperCase();

export const queryKeys = {
    homeTrains: ["trains", "home"] as const,
    mapTrains: ["trains", "map"] as const,
    stationMetadata: ["stations", "metadata"] as const,
    stationSchedules: (stationId: string) =>
        ["station", "schedules", normalizeStationId(stationId)] as const,
    stationMessages: (stationId: string) =>
        ["station", "messages", normalizeStationId(stationId)] as const,
    trainDetails: (trainId: string) => ["train", "details", trainId] as const,
    todayTrain: (trainId: string) => ["train", "today", trainId] as const,
    trainDistance: (trainNumber: string, locationTimestamp: string) =>
        ["train", "distance", trainNumber, locationTimestamp] as const,
};

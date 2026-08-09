import type { StationMetadata, StationMetadataType } from "../types/stationTypes";

const STATION_TYPES: ReadonlySet<StationMetadataType> = new Set(["STATION", "STOPPING_POINT"]);

type StationMetadataRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is StationMetadataRecord =>
    typeof value === "object" && value !== null;

const isFiniteCoordinate = (value: unknown, min: number, max: number): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

const isStationType = (value: unknown): value is StationMetadataType =>
    typeof value === "string" && STATION_TYPES.has(value as StationMetadataType);

export const normalizeStationMetadata = (value: unknown): StationMetadata[] => {
    if (!Array.isArray(value)) return [];

    const seenCodes = new Set<string>();
    const stations: StationMetadata[] = [];

    for (const entry of value) {
        if (!isRecord(entry)) continue;

        const countryCode = entry.countryCode;
        const stationName = entry.stationName;
        const stationShortCode = entry.stationShortCode;
        const type = entry.type;
        const latitude = entry.latitude;
        const longitude = entry.longitude;

        if (
            countryCode !== "FI" ||
            !isStationType(type) ||
            typeof stationName !== "string" ||
            !stationName.trim() ||
            typeof stationShortCode !== "string" ||
            !stationShortCode.trim() ||
            !isFiniteCoordinate(latitude, -90, 90) ||
            !isFiniteCoordinate(longitude, -180, 180)
        ) {
            continue;
        }

        const code = stationShortCode.trim();
        if (seenCodes.has(code)) continue;
        seenCodes.add(code);

        const stationUICCode = entry.stationUICCode;

        stations.push({
            countryCode: "FI",
            latitude,
            longitude,
            passengerTraffic: entry.passengerTraffic === true,
            stationName: stationName.trim(),
            stationShortCode: code,
            ...(typeof stationUICCode === "number" && Number.isFinite(stationUICCode)
                ? { stationUICCode }
                : {}),
            type,
        });
    }

    return stations;
};

export type StationTier = "major" | "commuter" | "minor";

export const getStationTier = (
    station: Pick<StationMetadata, "type" | "passengerTraffic">,
): StationTier => {
    if (!station.passengerTraffic) return "minor";
    return station.type === "STOPPING_POINT" ? "commuter" : "major";
};

export type StationFeatureCollection = {
    type: "FeatureCollection";
    features: Array<{
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        };
        properties: {
            code: string;
            name: string;
            passengerTraffic: boolean;
            type: StationMetadataType;
            tier: StationTier;
        };
    }>;
};

export const stationMetadataToGeoJson = (
    stations: StationMetadata[],
): StationFeatureCollection => ({
    type: "FeatureCollection",
    features: stations.map((station) => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [station.longitude, station.latitude],
        },
        properties: {
            code: station.stationShortCode,
            name: station.stationName,
            passengerTraffic: station.passengerTraffic,
            type: station.type,
            tier: getStationTier(station),
        },
    })),
});

import { describe, expect, it } from "bun:test";
import {
    getStationTier,
    normalizeStationMetadata,
    stationMetadataToGeoJson,
} from "./stationMetadata";

const station = (overrides: Record<string, unknown> = {}) => ({
    countryCode: "FI",
    latitude: 60.1719,
    longitude: 24.9414,
    passengerTraffic: true,
    stationName: "Helsinki asema",
    stationShortCode: "HKI",
    stationUICCode: 1,
    type: "STATION",
    ...overrides,
});

describe("station metadata normalization", () => {
    it("keeps Finnish stations and stopping points while excluding other point types", () => {
        const result = normalizeStationMetadata([
            station(),
            station({
                stationShortCode: "STP",
                stationName: "Testi seisake",
                type: "STOPPING_POINT",
            }),
            station({ countryCode: "RU", stationShortCode: "RUS" }),
            station({ type: "TURNOUT_IN_THE_OPEN_LINE", stationShortCode: "TURN" }),
        ]);

        expect(result.map(({ stationShortCode, type }) => [stationShortCode, type])).toEqual([
            ["HKI", "STATION"],
            ["STP", "STOPPING_POINT"],
        ]);
    });

    it("keeps Swedish stations while excluding other country codes", () => {
        const result = normalizeStationMetadata([
            station({
                countryCode: "SE",
                stationShortCode: "HPA",
                stationName: "Haaparanta pohjoinen",
            }),
            station({ countryCode: "RU", stationShortCode: "RUS", stationName: "Venäjän asema" }),
        ]);

        expect(
            result.map(({ stationShortCode, countryCode }) => [stationShortCode, countryCode]),
        ).toEqual([["HPA", "SE"]]);
    });

    it("rejects missing names and invalid coordinates", () => {
        const result = normalizeStationMetadata([
            station({ stationName: "" }),
            station({ stationShortCode: "BAD-LAT", latitude: 91 }),
            station({ stationShortCode: "BAD-LON", longitude: Number.NaN }),
            station({ stationShortCode: "VALID", stationName: "Valid" }),
        ]);

        expect(result.map(({ stationShortCode }) => stationShortCode)).toEqual(["VALID"]);
    });

    it("keeps the first valid record for a duplicate station code", () => {
        const result = normalizeStationMetadata([
            station(),
            station({ stationName: "Duplicate Helsinki" }),
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]?.stationName).toBe("Helsinki asema");
    });
});

describe("station tier", () => {
    it("classifies passenger stations as major", () => {
        expect(getStationTier(station() as Parameters<typeof getStationTier>[0])).toBe("major");
    });

    it("classifies passenger stopping points as commuter", () => {
        expect(
            getStationTier(
                station({ type: "STOPPING_POINT" }) as Parameters<typeof getStationTier>[0],
            ),
        ).toBe("commuter");
    });

    it("classifies non-passenger stations as minor", () => {
        expect(
            getStationTier(
                station({ passengerTraffic: false }) as Parameters<typeof getStationTier>[0],
            ),
        ).toBe("minor");
    });
});

describe("station metadata GeoJSON", () => {
    it("writes GeoJSON coordinates as longitude followed by latitude", () => {
        const [feature] = stationMetadataToGeoJson(normalizeStationMetadata([station()])).features;

        expect(feature?.geometry.coordinates).toEqual([24.9414, 60.1719]);
        expect(feature?.properties).toMatchObject({ code: "HKI", name: "Helsinki asema" });
    });

    it("writes the tier for each station", () => {
        const features = stationMetadataToGeoJson(
            normalizeStationMetadata([
                station(),
                station({ type: "STOPPING_POINT", stationShortCode: "STP" }),
                station({ passengerTraffic: false, stationShortCode: "MIN" }),
            ]),
        ).features;

        expect(features.map(({ properties }) => [properties.code, properties.tier])).toEqual([
            ["HKI", "major"],
            ["STP", "commuter"],
            ["MIN", "minor"],
        ]);
    });
});

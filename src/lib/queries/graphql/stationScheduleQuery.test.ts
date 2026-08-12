import { describe, expect, it } from "bun:test";
import { getStationScheduleQuery } from "./stationScheduleQuery";

describe("getStationScheduleQuery", () => {
    it("queries the selected day and the previous day for night trains", () => {
        const query = getStationScheduleQuery("HKI", "2026-08-12");

        expect(query).toContain('trainsByDepartureDate(departureDate: "2026-08-11"');
        expect(query).toContain('trainsByDepartureDate(departureDate: "2026-08-12"');
        expect(query).toContain("previousDay:");
        expect(query).toContain("selectedDay:");
    });

    it("filters to the station and the Helsinki day window", () => {
        const query = getStationScheduleQuery("hki", "2026-08-12");

        expect(query).toContain('shortCode: { equals: "hki" }');
        expect(query).toContain('greaterThan: "2026-08-11T20:59:59.999Z"');
        expect(query).toContain('lessThan: "2026-08-12T21:00:00.000Z"');
    });

    it("requests the fields the station UI needs", () => {
        const query = getStationScheduleQuery("HKI", "2026-08-12");

        expect(query).toContain("commuterLineid");
        expect(query).toContain("trainCategory");
        expect(query).toContain("commercialTrack");
        expect(query).toContain("liveEstimateTime");
        expect(query).toContain("estimateSourceType");
    });
});

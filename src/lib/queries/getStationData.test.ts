import { describe, expect, it, mock } from "bun:test";
import type { StationSchedule } from "../types/stationTypes";
import { getStationData } from "./getStationData";

const mockFetch = (body: string | null) => {
    globalThis.fetch = mock(() =>
        Promise.resolve(new Response(body, { status: 200 })),
    ) as unknown as typeof fetch;
};

describe("getStationData", () => {
    it("returns schedules when the API returns JSON", async () => {
        const schedules = [{ trainNumber: 1, timeTableRows: [] }] as unknown as StationSchedule[];
        mockFetch(JSON.stringify(schedules));

        const result = await getStationData("LOP");
        expect(result).toEqual(schedules);
    });

    it("returns an empty array when the API returns an empty body", async () => {
        mockFetch("");

        const result = await getStationData("LOP");
        expect(result).toEqual([]);
    });

    it("returns an empty array when the body is not an array", async () => {
        mockFetch("null");

        const result = await getStationData("LOP");
        expect(result).toEqual([]);
    });
});

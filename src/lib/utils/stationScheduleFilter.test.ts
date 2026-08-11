import { describe, expect, it } from "bun:test";
import type { StationSchedule } from "../types/stationTypes";
import { stationScheduleFilter } from "./stationScheduleFilter";

const schedule = (trainNumber: number, scheduledTime: string): StationSchedule => ({
    trainNumber,
    departureDate: "2026-08-02",
    operatorUICCode: 1,
    operatorShortCode: "VR",
    trainType: "IC",
    trainCategory: "Long-distance",
    commuterLineID: "",
    runningCurrently: false,
    cancelled: false,
    version: 1,
    timetableType: "REGULAR",
    timetableAcceptanceDate: "2026-01-01T00:00:00Z",
    timeTableRows: [
        {
            stationShortCode: "HKI",
            stationUICCode: 1,
            countryCode: "FI",
            type: "DEPARTURE",
            trainStopping: true,
            commercialStop: true,
            commercialTrack: "1",
            cancelled: false,
            scheduledTime,
            differenceInMinutes: 0,
            causes: [],
        },
    ],
});

const arrivingSchedule = (trainNumber: number, scheduledTime: string): StationSchedule => ({
    trainNumber,
    departureDate: "2026-08-02",
    operatorUICCode: 1,
    operatorShortCode: "VR",
    trainType: "IC",
    trainCategory: "Long-distance",
    commuterLineID: "",
    runningCurrently: false,
    cancelled: false,
    version: 1,
    timetableType: "REGULAR",
    timetableAcceptanceDate: "2026-01-01T00:00:00Z",
    timeTableRows: [
        {
            stationShortCode: "LOP",
            stationUICCode: 2,
            countryCode: "FI",
            type: "DEPARTURE",
            trainStopping: true,
            commercialStop: true,
            commercialTrack: "1",
            cancelled: false,
            scheduledTime: new Date(Date.now() + 60_000).toISOString(),
            differenceInMinutes: 0,
            causes: [],
        },
        {
            stationShortCode: "HKI",
            stationUICCode: 1,
            countryCode: "FI",
            type: "ARRIVAL",
            trainStopping: true,
            commercialStop: true,
            commercialTrack: "1",
            cancelled: false,
            scheduledTime,
            differenceInMinutes: 0,
            causes: [],
        },
    ],
});

describe("stationScheduleFilter", () => {
    it("finds the station row once per schedule and returns future schedules in order", () => {
        const now = Date.now();
        const future = new Date(now + 120_000).toISOString();
        const later = new Date(now + 240_000).toISOString();
        const past = new Date(now - 120_000).toISOString();

        expect(
            stationScheduleFilter(
                [schedule(20, later), schedule(10, past), schedule(30, future)],
                "HKI",
            ).map((item) => item.trainNumber),
        ).toEqual([30, 20]);
    });

    it("includes future terminating (arrival-only) trains", () => {
        const now = Date.now();
        const futureArrival = new Date(now + 120_000).toISOString();
        const pastArrival = new Date(now - 120_000).toISOString();

        expect(
            stationScheduleFilter(
                [arrivingSchedule(40, pastArrival), arrivingSchedule(50, futureArrival)],
                "HKI",
            ).map((item) => item.trainNumber),
        ).toEqual([50]);
    });
});

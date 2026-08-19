import { describe, expect, it } from "bun:test";
import type { TimeTableRow, TrainType } from "../types/trainTypes";
import { calculateTrainProgress, getNextCommercialStation } from "./trainStations";

const station = (shortCode: string, name: string) => ({
    passengerTraffic: true,
    countryCode: "FI",
    location: [24.94, 60.17] as [number, number],
    name,
    shortCode,
    uicCode: 1,
    type: "STATION" as const,
});

const row = (
    type: "ARRIVAL" | "DEPARTURE",
    shortCode: string,
    name: string,
    overrides: Partial<TimeTableRow> = {},
): TimeTableRow => ({
    type,
    trainStopping: true,
    commercialStop: true,
    commercialTrack: "1",
    cancelled: false,
    scheduledTime: new Date("2026-08-19T10:00:00Z"),
    actualTime: null as unknown as TimeTableRow["actualTime"],
    differenceInMinutes: 0,
    liveEstimateTime: null as unknown as TimeTableRow["liveEstimateTime"],
    station: station(shortCode, name),
    causes: null,
    ...overrides,
});

const makeTrain = (timeTableRows: TimeTableRow[]): TrainType => ({
    cancelled: false,
    commuterLineid: "",
    departureDate: new Date("2026-08-19T10:00:00Z"),
    runningCurrently: true,
    trainNumber: 495,
    trainType: { name: "H", trainCategory: { name: "Long-distance" } },
    timeTableRows,
    trainLocations: [],
});

const visited = (date: string) => ({ actualTime: new Date(date) });

describe("getNextCommercialStation", () => {
    it("returns the first unvisited commercial arrival in a normal case", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni"),
            row("ARRIVAL", "KRV", "Kiuruvesi"),
            row("ARRIVAL", "NVL", "Nivala"),
        ]);

        expect(getNextCommercialStation(train)?.station.name).toBe("Runni");
    });

    it("skips passed stations whose actualTime was never recorded", () => {
        // Runni was passed but Digitraffic left its actualTime null.
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni"),
            row("DEPARTURE", "RNN", "Runni"),
            row("ARRIVAL", "KRV", "Kiuruvesi", visited("2026-08-19T10:20:00Z")),
            row("ARRIVAL", "PHÄ", "Pyhäsalmi", visited("2026-08-19T10:40:00Z")),
            row("ARRIVAL", "HPJ", "Haapajärvi", visited("2026-08-19T11:00:00Z")),
            row("DEPARTURE", "HPJ", "Haapajärvi", visited("2026-08-19T11:01:00Z")),
            row("ARRIVAL", "NVL", "Nivala"),
            row("ARRIVAL", "YV", "Ylivieska"),
        ]);

        expect(getNextCommercialStation(train)?.station.name).toBe("Nivala");
    });

    it("returns the first arrival when the train has not left the origin", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi"),
            row("ARRIVAL", "RNN", "Runni"),
            row("ARRIVAL", "KRV", "Kiuruvesi"),
        ]);

        expect(getNextCommercialStation(train)?.station.name).toBe("Runni");
    });

    it("returns the stop after the station the train is currently at", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni", visited("2026-08-19T10:10:00Z")),
            row("DEPARTURE", "RNN", "Runni"),
            row("ARRIVAL", "KRV", "Kiuruvesi"),
        ]);

        expect(getNextCommercialStation(train)?.station.name).toBe("Kiuruvesi");
    });

    it("skips cancelled stops when picking the next station", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni", { cancelled: true }),
            row("ARRIVAL", "KRV", "Kiuruvesi"),
        ]);

        expect(getNextCommercialStation(train)?.station.name).toBe("Kiuruvesi");
    });

    it("returns undefined once the journey is complete", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni", visited("2026-08-19T10:10:00Z")),
            row("DEPARTURE", "RNN", "Runni", visited("2026-08-19T10:11:00Z")),
            row("ARRIVAL", "KRV", "Kiuruvesi", visited("2026-08-19T10:20:00Z")),
        ]);

        expect(getNextCommercialStation(train)).toBeUndefined();
    });
});

describe("calculateTrainProgress", () => {
    it("counts completed stops by position even when a passed stop lacks actualTime", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni"),
            row("DEPARTURE", "RNN", "Runni"),
            row("ARRIVAL", "KRV", "Kiuruvesi", visited("2026-08-19T10:20:00Z")),
            row("ARRIVAL", "PHÄ", "Pyhäsalmi", visited("2026-08-19T10:40:00Z")),
            row("ARRIVAL", "HPJ", "Haapajärvi", visited("2026-08-19T11:00:00Z")),
            row("DEPARTURE", "HPJ", "Haapajärvi", visited("2026-08-19T11:01:00Z")),
            row("ARRIVAL", "NVL", "Nivala"),
            row("ARRIVAL", "YV", "Ylivieska"),
        ]);

        const progress = calculateTrainProgress(train);

        expect(progress.completed).toBe(4);
        expect(progress.total).toBe(6);
        expect(progress.percentage).toBeCloseTo(66.67);
        expect(progress.lastCompletedStop?.station.name).toBe("Haapajärvi");
        expect(progress.nextStop?.station.name).toBe("Nivala");
    });

    it("does not count or pick cancelled stops", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi", visited("2026-08-19T10:00:00Z")),
            row("ARRIVAL", "RNN", "Runni", { cancelled: true }),
            row("ARRIVAL", "KRV", "Kiuruvesi"),
        ]);

        const progress = calculateTrainProgress(train);

        expect(progress.completed).toBe(0);
        expect(progress.nextStop?.station.name).toBe("Kiuruvesi");
    });

    it("returns zero progress before the train departs", () => {
        const train = makeTrain([
            row("DEPARTURE", "ILM", "Iisalmi"),
            row("ARRIVAL", "RNN", "Runni"),
        ]);

        const progress = calculateTrainProgress(train);

        expect(progress.completed).toBe(0);
        expect(progress.percentage).toBe(0);
        expect(progress.lastCompletedStop).toBeNull();
        expect(progress.nextStop?.station.name).toBe("Runni");
    });
});

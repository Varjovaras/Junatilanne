import { describe, expect, it } from "bun:test";
import type { TimeTableRow, TrainType } from "../types/trainTypes";
import { distanceBetweenCoordinates } from "./trainDirection";
import { getTrackDistancesForLines, type Coordinate } from "./trackDistance";

const station = (shortCode: string, name: string, location: Coordinate) => ({
    passengerTraffic: true,
    countryCode: "FI",
    location,
    name,
    shortCode,
    uicCode: 1,
    type: "STATION" as const,
});

const row = (
    type: "ARRIVAL" | "DEPARTURE",
    shortCode: string,
    name: string,
    location: Coordinate,
    overrides: Partial<TimeTableRow> = {},
): TimeTableRow => ({
    type,
    trainStopping: true,
    commercialStop: true,
    commercialTrack: "",
    cancelled: false,
    scheduledTime: new Date("2026-08-03T10:00:00Z"),
    actualTime: null as unknown as TimeTableRow["actualTime"],
    differenceInMinutes: 0,
    liveEstimateTime: null as unknown as TimeTableRow["liveEstimateTime"],
    station: station(shortCode, name, location),
    causes: null,
    ...overrides,
});

const makeTrain = (location: Coordinate): TrainType => ({
    cancelled: false,
    commuterLineid: "",
    departureDate: new Date("2026-08-03T05:00:00Z"),
    runningCurrently: true,
    trainNumber: 123,
    trainType: { name: "IC", trainCategory: { name: "Long-distance" } },
    trainLocations: [{ speed: 80, timestamp: "2026-08-03T10:00:00Z", location }],
    timeTableRows: [
        row("DEPARTURE", "A", "Asema A", [25, 60], {
            actualTime: new Date("2026-08-03T10:00:00Z"),
        }),
        row("ARRIVAL", "B", "Asema B", [25, 60.02]),
        row("ARRIVAL", "C", "Asema C", [25, 60.015]),
    ],
});

// A squiggly line so the along-track distance clearly exceeds the straight line.
const BENT_PATH: Coordinate[] = [
    [25, 60],
    [25.01, 60],
    [25.01, 60.01],
    [25, 60.01],
    [25, 60.02],
];

describe("getTrackDistancesForLines", () => {
    it("measures along the track, which is longer than the straight line", () => {
        const result = getTrackDistancesForLines(makeTrain([25, 60]), [BENT_PATH]);

        expect(result?.method).toBe("track");
        // A -> B along the bent path: ~3340 m
        expect(result?.toNextStationKm).toBeCloseTo(3.34, 2);
        // A -> C (halfway through the last leg): ~2783 m
        expect(result?.toDestinationKm).toBeCloseTo(2.78, 2);
        expect(result!.toNextStationKm).toBeGreaterThan(result!.toDestinationKm);
    });

    it("snaps a train that is mid-segment", () => {
        const result = getTrackDistancesForLines(makeTrain([25.005, 60]), [BENT_PATH]);

        // Half of the first leg plus the remaining three legs: ~3061 m
        expect(result?.toNextStationKm).toBeCloseTo(3.06, 2);
        // Half of the first leg plus two legs plus half the last: ~2505 m
        expect(result?.toDestinationKm).toBeCloseTo(2.5, 2);
    });

    it("handles train and target on the same segment", () => {
        const singleSegment: Coordinate[] = [
            [25, 60],
            [25, 60.01],
        ];
        const train = makeTrain([25, 60]);
        train.timeTableRows = [
            row("DEPARTURE", "A", "Asema A", [25, 60], {
                actualTime: new Date("2026-08-03T10:00:00Z"),
            }),
            row("ARRIVAL", "B", "Asema B", [25, 60.005]),
            row("ARRIVAL", "C", "Asema C", [25, 60.01]),
        ];

        const result = getTrackDistancesForLines(train, [singleSegment]);

        expect(result?.toNextStationKm).toBeCloseTo(0.56, 2);
        expect(result?.toDestinationKm).toBeCloseTo(1.11, 2);
    });

    it("falls back to the straight line when the network is unavailable", () => {
        const result = getTrackDistancesForLines(makeTrain([25, 60]), undefined);

        expect(result?.method).toBe("straightLine");
        const straightToB = distanceBetweenCoordinates([25, 60], [25, 60.02]) / 1000;
        expect(result?.toNextStationKm).toBeCloseTo(straightToB, 3);
    });

    it("falls back to the straight line when the track cannot be joined", () => {
        const isolatedTrack: Coordinate[] = [
            [25.5, 60],
            [25.5, 60.001],
        ];
        const result = getTrackDistancesForLines(makeTrain([25, 60]), [isolatedTrack]);

        expect(result?.method).toBe("straightLine");
        const straightToNext = distanceBetweenCoordinates([25, 60], [25, 60.02]) / 1000;
        expect(result?.toNextStationKm).toBeCloseTo(straightToNext, 3);
    });

    it("returns null when the train has no location", () => {
        const train = makeTrain([25, 60]);
        train.trainLocations = [];

        expect(getTrackDistancesForLines(train, [BENT_PATH])).toBeNull();
    });
});

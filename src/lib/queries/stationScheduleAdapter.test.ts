import { describe, expect, it } from "bun:test";
import type { StationScheduleGraphQLTrain } from "./graphql/stationScheduleQuery";
import { adaptStationSchedule } from "./stationScheduleAdapter";

const makeTrain = (): StationScheduleGraphQLTrain => ({
    cancelled: false,
    commuterLineid: "P",
    departureDate: new Date("2026-08-12"),
    runningCurrently: true,
    trainNumber: 9741,
    version: 2,
    timetableType: "REGULAR",
    trainType: {
        name: "HL",
        trainCategory: {
            name: "Commuter",
        },
    },
    timeTableRows: [
        {
            type: "DEPARTURE",
            trainStopping: true,
            commercialStop: true,
            commercialTrack: "3",
            cancelled: false,
            scheduledTime: new Date("2026-08-12T09:00:00.000Z"),
            actualTime: new Date("2026-08-12T09:02:00.000Z"),
            differenceInMinutes: 2,
            liveEstimateTime: new Date("2026-08-12T09:02:00.000Z"),
            estimateSourceType: "LIVE_ESTIMATE",
            station: {
                countryCode: "FI",
                shortCode: "HKI",
                uicCode: 100,
            },
            causes: [
                {
                    categoryCode: { code: "13", name: "Vaihdevika", validFrom: "", validTo: null },
                    detailedCategoryCode: {
                        code: "131",
                        name: "Vaihdevika",
                        validFrom: "",
                        validTo: null,
                    },
                    thirdCategoryCode: {
                        code: "1311",
                        name: "Vaihdevika",
                        validFrom: "",
                        validTo: null,
                    },
                },
            ],
        },
    ],
});

describe("adaptStationSchedule", () => {
    it("maps GraphQL train fields to the REST-shaped schedule", () => {
        const schedule = adaptStationSchedule(makeTrain());

        expect(schedule.trainNumber).toBe(9741);
        expect(schedule.departureDate).toBe("2026-08-12");
        expect(schedule.trainType).toBe("HL");
        expect(schedule.trainCategory).toBe("Commuter");
        expect(schedule.commuterLineID).toBe("P");
        expect(schedule.runningCurrently).toBe(true);
        expect(schedule.version).toBe(2);
        expect(schedule.timetableType).toBe("REGULAR");
    });

    it("maps time table rows including station and cause data", () => {
        const schedule = adaptStationSchedule(makeTrain());
        const row = schedule.timeTableRows[0];

        expect(row.stationShortCode).toBe("HKI");
        expect(row.stationUICCode).toBe(100);
        expect(row.countryCode).toBe("FI");
        expect(row.type).toBe("DEPARTURE");
        expect(row.commercialStop).toBe(true);
        expect(row.scheduledTime).toBe("2026-08-12T09:00:00.000Z");
        expect(row.actualTime).toBe("2026-08-12T09:02:00.000Z");
        expect(row.estimateSource).toBe("LIVE_ESTIMATE");
        expect(row.causes[0].categoryCode.code).toBe("13");
    });

    it("keeps optional times and causes undefined-safe", () => {
        const train = makeTrain();
        train.timeTableRows[0].actualTime = undefined;
        train.timeTableRows[0].liveEstimateTime = undefined;
        train.timeTableRows[0].causes = null;

        const schedule = adaptStationSchedule(train);
        const row = schedule.timeTableRows[0];

        expect(row.actualTime).toBeUndefined();
        expect(row.liveEstimateTime).toBeUndefined();
        expect(row.causes).toEqual([]);
    });

    it("skips rows without station metadata", () => {
        const train = makeTrain();
        train.timeTableRows = [
            { ...train.timeTableRows[0], station: null },
            train.timeTableRows[0],
        ];

        const schedule = adaptStationSchedule(train);

        expect(schedule.timeTableRows).toHaveLength(1);
        expect(schedule.timeTableRows[0].stationShortCode).toBe("HKI");
    });
});

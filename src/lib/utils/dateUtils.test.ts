import { describe, expect, it } from "bun:test";
import { addDays, getHelsinkiDayWindow, helsinkiDateKey, todayInHelsinki } from "./dateUtils";

describe("helsinki date helpers", () => {
    it("formats a date as a Helsinki date key", () => {
        expect(helsinkiDateKey(new Date("2026-08-12T12:00:00.000Z"))).toBe("2026-08-12");
        expect(helsinkiDateKey(new Date("2026-08-12T21:30:00.000Z"))).toBe("2026-08-13");
    });

    it("adds days across month boundaries", () => {
        expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
        expect(addDays("2026-08-12", 0)).toBe("2026-08-12");
    });

    it("returns a valid Helsinki date for today", () => {
        expect(todayInHelsinki()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("builds an exclusive UTC window covering one Helsinki day", () => {
        const window = getHelsinkiDayWindow("2026-08-12");

        expect(window.startIso).toBe("2026-08-11T20:59:59.999Z");
        expect(window.endIso).toBe("2026-08-12T21:00:00.000Z");
    });
});

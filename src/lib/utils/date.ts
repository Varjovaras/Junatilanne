import type { Translations } from "../i18n/translations";

export const formatTime = (date: Date | string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    return value.toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Helsinki",
    });
};

export const formatDateForUrl = (date: string) => {
    const [year, month, day] = date.split("-");
    const formattedMonth = month.padStart(2, "0");
    const formattedDay = day.padStart(2, "0");
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
    return formattedDate;
};

export const helsinkiDateKey = (date: Date): string => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Helsinki",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
};

export const todayInHelsinki = () => helsinkiDateKey(new Date());

export const addDays = (date: string, days: number): string => {
    const result = new Date(`${date}T00:00:00.000Z`);
    result.setUTCDate(result.getUTCDate() + days);
    return result.toISOString().split("T")[0];
};

const getHelsinkiOffsetMs = (instant: Date): number => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Helsinki",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(instant);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((part) => part.type === type)?.value ?? 0);
    const hour = get("hour") % 24;

    return (
        Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second")) -
        instant.getTime()
    );
};

// Convert a Helsinki calendar date to the UTC instant of its local midnight.
// The offset lookup is repeated because the first guess can land on the other
// side of a DST transition on the two transition days of the year.
export const helsinkiMidnightUtc = (date: string): number => {
    const [year, month, day] = date.split("-").map(Number);
    const targetUtc = Date.UTC(year, month - 1, day);
    let instant = targetUtc;

    for (let i = 0; i < 4; i += 1) {
        const next = targetUtc - getHelsinkiOffsetMs(new Date(instant));
        if (next === instant) break;
        instant = next;
    }

    return instant;
};

// Half-open time window covering one Helsinki day. GraphQL only supports
// strict greater/less comparisons, so startIso is shifted back by 1 ms to
// include events exactly at local midnight.
export const getHelsinkiDayWindow = (date: string) => {
    const startMs = helsinkiMidnightUtc(date);
    const endMs = helsinkiMidnightUtc(addDays(date, 1));

    return {
        startMs,
        endMs,
        startIso: new Date(startMs - 1).toISOString(),
        endIso: new Date(endMs).toISOString(),
    };
};

export const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fi-FI", {
        timeZone: "Europe/Helsinki",
    });
};

export const isToday = (date: string) => {
    return helsinkiDateKey(new Date()) === helsinkiDateKey(new Date(date));
};

export const isTomorrow = (date: string) => {
    return addDays(todayInHelsinki(), 1) === date.slice(0, 10);
};

export const getArrivalCountdown = (arrivalTime: Date, translations: Translations): string => {
    const now = new Date();
    const minutesUntilArrival = Math.round((arrivalTime.getTime() - now.getTime()) / (1000 * 60));

    if (minutesUntilArrival > 0) {
        return translations.arrivalInMinutes.replace("{n}", String(minutesUntilArrival));
    }
    if (minutesUntilArrival === 0) {
        return translations.arrivingNow;
    }
    return translations.arrived;
};

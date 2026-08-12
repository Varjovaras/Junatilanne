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

export const todayISOString = () => {
    return new Date().toISOString().split("T")[0];
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

// Exclusive time window covering one Helsinki day, as UTC ISO strings.
export const getHelsinkiDayWindow = (date: string) => {
    const start = addDays(date, -1);
    const end = date;
    return {
        startIso: `${start}T20:59:59.999Z`,
        endIso: `${end}T21:00:00.000Z`,
    };
};

export const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fi-FI", {
        timeZone: "Europe/Helsinki",
    });
};

export const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("fi-FI", {
        timeZone: "Europe/Helsinki",
    });
};

export const isToday = (date: string) => {
    return helsinkiDateKey(new Date()) === helsinkiDateKey(new Date(date));
};

export const isTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return helsinkiDateKey(tomorrow) === helsinkiDateKey(new Date(date));
};

export const getDateDisplay = (date: string, translations: Translations) => {
    if (isToday(date)) return translations.today;
    if (isTomorrow(date)) return translations.tomorrow;
    return formatTime(date);
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

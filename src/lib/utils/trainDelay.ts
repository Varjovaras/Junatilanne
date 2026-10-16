import type { TrainGroup } from "./trainClassification";
import type { TrainType } from "../types/trainTypes";

export const getTrainCurrentDelay = (train: TrainType): number => {
    for (let index = train.timeTableRows.length - 1; index >= 0; index -= 1) {
        const row = train.timeTableRows[index];
        if (row.actualTime !== null) return row.differenceInMinutes;
    }
    return 0;
};

export const filterTrainsByDelay = (trains: TrainType[], thresholdMinutes: number): TrainType[] => {
    if (thresholdMinutes === 0) return trains;

    return trains.filter((train) => {
        const currentDelay = getTrainCurrentDelay(train);
        return currentDelay >= thresholdMinutes;
    });
};

export const getDelayColorClass = (delayMinutes: number): string => {
    if (delayMinutes <= 0) {
        return "text-green-500"; // On time or early
    }
    if (delayMinutes <= 3) {
        return "text-yellow-400"; // 1-3 minutes late
    }
    if (delayMinutes <= 5) {
        return "text-orange-300"; // 4-5 minutes late
    }
    if (delayMinutes <= 6) {
        return "text-orange-400"; // 6 minutes late
    }
    if (delayMinutes <= 7) {
        return "text-orange-500"; // 7 minutes late
    }
    if (delayMinutes <= 8) {
        return "text-orange-600"; // 8 minutes late
    }
    if (delayMinutes <= 10) {
        return "text-red-400"; // 9-10 minutes late
    }
    if (delayMinutes <= 12) {
        return "text-red-500"; // 11-12 minutes late
    }
    if (delayMinutes <= 15) {
        return "text-red-600"; // 13-15 minutes late
    }
    if (delayMinutes <= 20) {
        return "text-red-700"; // 16-20 minutes late
    }
    if (delayMinutes <= 30) {
        return "text-red-800"; // 21-30 minutes late
    }
    if (delayMinutes <= 45) {
        return "text-red-900"; // 31-45 minutes late
    }
    return "text-red-800"; // 45+ minutes late
};

/** Minutes of delay after which a train is shown in the "very late" colour. */
export const DELAY_FULL_COLOR_MINUTES = 30;

type Rgb = readonly [number, number, number];

const hexToRgb = (hex: string): Rgb => {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

// On-time colours are the fixed brand-ish green/blue; the ramp through the
// intermediate stops (Okabe–Ito, chosen to stay distinguishable for common
// colour vision deficiencies) leads both categories to the same vermillion, so
// an on-time green and a very late red never rely on a red/green comparison
// alone.
const LONG_DISTANCE_COLOR_STOPS: readonly Rgb[] = [
    hexToRgb("#02893f"), // on time: green
    hexToRgb("#f0e442"), // yellow
    hexToRgb("#e69f00"), // orange
    hexToRgb("#d55e00"), // very late: vermillion
];

const COMMUTER_COLOR_STOPS: readonly Rgb[] = [
    hexToRgb("#0074bf"), // on time: blue
    hexToRgb("#cc79a7"), // reddish purple
    hexToRgb("#d55e00"), // very late: vermillion
];

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

const interpolateStops = (stops: readonly Rgb[], amount: number): Rgb => {
    const scaled = Math.min(Math.max(amount, 0), 1) * (stops.length - 1);
    const index = Math.min(Math.floor(scaled), stops.length - 2);
    const local = scaled - index;
    const from = stops[index];
    const to = stops[index + 1];

    return [lerp(from[0], to[0], local), lerp(from[1], to[1], local), lerp(from[2], to[2], local)];
};

const toCssColor = (rgb: Rgb) =>
    `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])})`;

// Perceived brightness (ITU-R BT.601) decides whether the train name is drawn
// light or dark so it stays readable across the whole ramp.
const isLightColor = (rgb: Rgb) => (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255 > 0.6;

export const getTrainBallColors = (
    delayMinutes: number,
    category: TrainGroup,
): { ball: string; text: string } => {
    const safeDelay = Number.isFinite(delayMinutes) ? delayMinutes : 0;
    const amount = safeDelay / DELAY_FULL_COLOR_MINUTES;
    const stops = category === "commuter" ? COMMUTER_COLOR_STOPS : LONG_DISTANCE_COLOR_STOPS;
    const rgb = interpolateStops(stops, amount);

    return { ball: toCssColor(rgb), text: isLightColor(rgb) ? "#1a1a1a" : "#ffffff" };
};

const STATION_CODE_PATTERN = /^[A-ZÄÖÅ0-9_]{2,4}$/;

export const normalizeStationCode = (code: string): string => code.trim().toUpperCase();

export const isValidStationCodeShape = (value: unknown): value is string =>
    typeof value === "string" && STATION_CODE_PATTERN.test(normalizeStationCode(value));

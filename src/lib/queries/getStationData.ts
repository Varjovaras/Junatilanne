import type { StationSchedule } from "../types/stationTypes";
import { DIGITRAFFIC_USER_HEADERS } from "./digitrafficHeaders";

const REST_ENDPOINT = "https://rata.digitraffic.fi/api/v1/live-trains/station/";

export const getStationData = async (
    stationId: string,
    { signal }: { signal?: AbortSignal } = {},
) => {
    const url = new URL(`${REST_ENDPOINT}${stationId}`);
    //fetch 24 hours of train departures and arrivals
    const searchParams = new URLSearchParams({
        minutes_before_departure: "1440",
        minutes_after_departure: "0",
        minutes_before_arrival: "1440",
        minutes_after_arrival: "0",
    });
    url.search = searchParams.toString();

    const res = await fetch(url.toString(), {
        headers: { ...DIGITRAFFIC_USER_HEADERS },
        cache: "no-store",
        signal,
    });

    if (!res.ok) throw new Error(`Station data not available. HTTP error! status: ${res.status} `);

    const raw = await res.text();
    const stations = raw ? (JSON.parse(raw) as StationSchedule[]) : [];
    return Array.isArray(stations) ? stations : [];
};

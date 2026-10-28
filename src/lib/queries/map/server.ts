import { createServerFn } from "@tanstack/react-start";

export const fetchStationMetadata = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedStationMetadata } = await import("./getCachedStationMetadata");

    return getCachedStationMetadata();
});

export const fetchMapTrains = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedMapTrains } = await import("./getCachedMapTrains");

    return getCachedMapTrains();
});

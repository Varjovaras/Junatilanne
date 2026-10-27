import { createServerFn } from "@tanstack/react-start";
import { getStationMetadata } from "./getStationMetadata";

export const fetchStationMetadata = createServerFn({ method: "GET" }).handler(() =>
    getStationMetadata(),
);

export const fetchMapTrains = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedMapTrains } = await import("./getCachedMapTrains");

    return getCachedMapTrains();
});

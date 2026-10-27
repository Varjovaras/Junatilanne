import { createServerFn } from "@tanstack/react-start";

export const fetchTrainData = createServerFn({ method: "GET" }).handler(async () => {
    const { getCachedTrains } = await import("./getCachedTrains");

    return getCachedTrains();
});

import { createServerFn } from "@tanstack/react-start";
import { getStationMessages } from "./getStationMessages";

export const fetchStationMessages = createServerFn({ method: "GET" })
    .validator((stationId: string) => stationId)
    .handler(({ data: stationId }) => getStationMessages(stationId));

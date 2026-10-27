import { createServerFn } from "@tanstack/react-start";
import { getStationMetadata } from "./getStationMetadata";

export const fetchStationMetadata = createServerFn({ method: "GET" }).handler(() =>
    getStationMetadata(),
);

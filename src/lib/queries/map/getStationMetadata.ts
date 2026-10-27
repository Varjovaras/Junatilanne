import { normalizeStationMetadata } from "../../utils/stationMetadata";
import { DIGITRAFFIC_USER_HEADERS } from "../shared/digitrafficHeaders";
import type { StationMetadata } from "../../types/stationTypes";

const STATION_METADATA_ENDPOINT = "https://rata.digitraffic.fi/api/v1/metadata/stations";

export const getStationMetadata = async ({ signal }: { signal?: AbortSignal } = {}): Promise<
    StationMetadata[]
> => {
    const response = await fetch(STATION_METADATA_ENDPOINT, {
        headers: { Accept: "application/json", ...DIGITRAFFIC_USER_HEADERS },
        cache: "no-store",
        signal,
    });

    if (!response.ok) {
        throw new Error(`Station metadata not available. HTTP error! status: ${response.status}`);
    }

    return normalizeStationMetadata(await response.json());
};

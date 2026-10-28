import { defineTask } from "nitro/task";
import { getCachedStationMetadata } from "@/lib/queries/map/getCachedStationMetadata";

export default defineTask({
    meta: {
        name: "refresh-station-metadata",
        description:
            "Refresh the station metadata cache so the first map visitor never waits for it",
    },
    run: async () => {
        await getCachedStationMetadata();
        return { result: "Station metadata cache refreshed" };
    },
});

import { defineTask } from "nitro/task";
import { getCachedMapTrains } from "@/lib/queries/map/getCachedMapTrains";

export default defineTask({
    meta: {
        name: "refresh-map-trains",
        description: "Refresh the map trains cache so the first visitor never waits for it",
    },
    run: async () => {
        await getCachedMapTrains();
        return { result: "Map trains cache refreshed" };
    },
});

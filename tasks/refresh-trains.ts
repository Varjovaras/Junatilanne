import { defineTask } from "nitro/task";
import { getCachedTrains } from "@/lib/queries/home/getCachedTrains";

export default defineTask({
    meta: {
        name: "refresh-trains",
        description: "Refresh the home trains cache so the first visitor never waits for it",
    },
    run: async () => {
        await getCachedTrains();
        return { result: "Trains cache refreshed" };
    },
});

import { fileURLToPath } from "node:url";
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
    plugins: [fileURLToPath(new URL("./plugins/warm-railway-graph.ts", import.meta.url))],
    storage: {
        "": { driver: "fs", base: "./.data/cache" },
    },
    experimental: {
        tasks: true,
    },
    tasks: {
        "refresh-trains": {
            handler: fileURLToPath(new URL("./tasks/refresh-trains.ts", import.meta.url)),
            description: "Refresh the home trains cache so the first visitor never waits for it",
        },
        "refresh-map-trains": {
            handler: fileURLToPath(new URL("./tasks/refresh-map-trains.ts", import.meta.url)),
            description: "Refresh the map trains cache so the first visitor never waits for it",
        },
        "refresh-station-metadata": {
            handler: fileURLToPath(new URL("./tasks/refresh-station-metadata.ts", import.meta.url)),
            description:
                "Refresh the station metadata cache so the first map visitor never waits for it",
        },
    },
    scheduledTasks: {
        "* * * * *": ["refresh-trains", "refresh-map-trains"],
        "0 4 * * *": ["refresh-station-metadata"],
    },
});

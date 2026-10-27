import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
    storage: {
        "": { driver: "fs", base: "./.data/cache" },
    },
    // plugins: ["./server/plugins/compress"],
});

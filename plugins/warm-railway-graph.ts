import { definePlugin } from "nitro";
import { warmRailwayGraph } from "@/lib/railway/graph";

// The graph and segment caches are process-level, so every fresh process has to
// build the graph once. Start that at server startup instead of making the
// first distance request pay for it. Fire-and-forget: warming must not delay
// server readiness, and requests arriving mid-warm share the same build.
export default definePlugin(() => {
    void warmRailwayGraph().catch((error) => {
        console.error("[railway] Failed to warm the railway graph", error);
    });
});

import { createFileRoute } from "@tanstack/react-router";
import { getCachedMapTrains } from "@/lib/queries/map/getCachedMapTrains";

export const Route = createFileRoute("/api/trains")({
    server: {
        handlers: {
            POST: async () => {
                try {
                    return Response.json({
                        data: { currentlyRunningTrains: await getCachedMapTrains() },
                    });
                } catch (error) {
                    console.error("Error fetching train data:", error);
                    return Response.json({ error: "Failed to fetch train data" }, { status: 500 });
                }
            },
        },
    },
});

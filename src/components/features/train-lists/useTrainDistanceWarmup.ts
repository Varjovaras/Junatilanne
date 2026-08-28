import { useEffect } from "react";
import type { TrainType } from "@/lib/types/trainTypes";
import { getTrackDistances } from "@/lib/utils/trackDistance";

// Waits for a moment when the browser is idle, so background work never
// competes with rendering or input handling.
const yieldToIdle = (): Promise<void> =>
    new Promise((resolve) => {
        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(() => resolve(), { timeout: 100 });
        } else {
            setTimeout(resolve, 0);
        }
    });

// Precomputes the distance segments for the displayed trains during idle time.
// The per-train computation is chunked and yields between trains, so expanding
// a row on the homepage shows the distances immediately instead of computing
// them on the spot. Results are cached per station pair, so later queries
// (including the train details page) resolve in milliseconds.
export const useTrainDistanceWarmup = (trains: TrainType[]): void => {
    useEffect(() => {
        let cancelled = false;
        const queue = [...trains];

        const run = async (): Promise<void> => {
            while (!cancelled && queue.length > 0) {
                const train = queue.shift()!;
                try {
                    await getTrackDistances(train);
                } catch {
                    // A failed warm-up is not fatal; skip this train.
                }
                if (!cancelled) await yieldToIdle();
            }
        };

        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(run, { timeout: 2_000 });
        } else {
            setTimeout(run, 200);
        }

        return () => {
            cancelled = true;
        };
    }, [trains]);
};

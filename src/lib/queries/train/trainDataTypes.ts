import type { TrackDistances } from "@/lib/railway/graph";
import type { TrainType } from "../../types/trainTypes";

export type TrainDetailsData = {
    kind: "invalid" | "date" | "live";
    train: TrainType | null;
};

export type TrainPageData = TrainDetailsData & {
    distance: TrackDistances | null;
};

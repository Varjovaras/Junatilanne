import type { TrainType } from "@/lib/types/trainTypes";
import { getTrainCurrentDelay } from "@/lib/train/delay";

export const SORT_FIELDS = ["trainNumber", "delay"] as const;
export const SORT_DIRECTIONS = ["asc", "desc"] as const;

type SortField = (typeof SORT_FIELDS)[number];
type SortDirection = (typeof SORT_DIRECTIONS)[number];

export type SortOption = {
    field: SortField;
    direction: SortDirection;
};

export const DEFAULT_SORT: SortOption = {
    field: "delay",
    direction: "desc",
};

export const isDefaultSort = (sort: SortOption): boolean =>
    sort.field === DEFAULT_SORT.field && sort.direction === DEFAULT_SORT.direction;

export const formatSortParam = (sort: SortOption): string => `${sort.field}-${sort.direction}`;

export const parseSortParam = (value: unknown): SortOption | undefined => {
    if (typeof value !== "string") return undefined;

    const parts = value.split("-");

    if (parts.length !== 2) return undefined;

    const [field, direction] = parts;

    if (!(SORT_FIELDS as readonly string[]).includes(field)) return undefined;
    if (!(SORT_DIRECTIONS as readonly string[]).includes(direction)) return undefined;

    return {
        field: field as SortField,
        direction: direction as SortDirection,
    };
};

export const sortTrains = (trains: TrainType[], sortOption: SortOption) => {
    const multiplier = sortOption.direction === "asc" ? 1 : -1;

    if (sortOption.field === "trainNumber") {
        return [...trains].sort((a, b) => (a.trainNumber - b.trainNumber) * multiplier);
    }

    return trains
        .map((train) => ({ train, delay: getTrainCurrentDelay(train) }))
        .sort((a, b) => (a.delay - b.delay) * multiplier)
        .map(({ train }) => train);
};

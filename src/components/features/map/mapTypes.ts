export type MapPopupSelection =
    | { type: "station"; id: string }
    | { type: "train"; id: string }
    | null;

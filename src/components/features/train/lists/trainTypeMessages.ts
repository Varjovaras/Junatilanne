import type { Translations } from "@/lib/i18n/translations";

export type TrainTypeFilter = "commuter" | "longDistance" | "freight" | "all";

export const getLateTrainsTitle = (
    trainType: TrainTypeFilter,
    translations: Translations,
): string => {
    switch (trainType) {
        case "commuter":
            return translations.lateCommuter;
        case "longDistance":
            return translations.lateLongDistance;
        case "freight":
            return translations.lateFreight;
        default:
            return translations.lateTrains;
    }
};

export const getNoTrainsMessage = (
    trainType: TrainTypeFilter,
    translations: Translations,
): string => {
    switch (trainType) {
        case "commuter":
            return translations.noCommuterTrainsLate;
        case "longDistance":
            return translations.noLongDistanceTrainsLate;
        case "freight":
            return translations.noFreightTrainsLate;
        default:
            return translations.noTrainsLate;
    }
};

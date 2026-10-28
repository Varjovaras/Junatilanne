import type { Translations } from "@/lib/i18n/translations";
import type { TrainCategoryFilter } from "@/lib/train/classification";

export type TrainTypeFilter = TrainCategoryFilter;

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
        case "other":
            return translations.lateOther;
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
        case "other":
            return translations.noOtherTrainsLate;
        default:
            return translations.noTrainsLate;
    }
};

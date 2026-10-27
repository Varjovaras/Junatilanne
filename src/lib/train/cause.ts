import type { Cause } from "@/lib/types/trainTypes";

export const hasMeaningfulCauseText = (cause: Cause): boolean => {
    const hasCategory = cause.categoryCode?.name?.trim().length > 0;
    const hasDetails = cause.detailedCategoryCode?.name?.trim().length > 0;
    const hasAdditionalInfo = cause.thirdCategoryCode?.name?.trim().length > 0;
    return hasCategory || hasDetails || hasAdditionalInfo;
};

export const getCauseKey = (cause: Cause): string => {
    return `${cause.categoryCode?.code ?? "c"}-${cause.detailedCategoryCode?.code ?? "d"}-${
        cause.thirdCategoryCode?.code ?? "t"
    }`;
};

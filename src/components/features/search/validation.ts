import type { Translations } from "@/lib/i18n/translations";

export const handleSearchError = (error: string, setError: (error: string) => void) => {
    console.error(error);
    setError(error);
    return false;
};

export const validateTrainNumber = (trainNumber: string, translations: Translations) => {
    if (!trainNumber.trim()) {
        return translations.enterTrainNumber;
    }
    if (Number.isNaN(Number(trainNumber))) {
        return translations.invalidTrainNumber;
    }
    return null;
};

export const validateDate = (date: string, translations: Translations) => {
    if (!date) {
        return translations.selectDate;
    }
    return null;
};

import { useTranslations } from "@/lib/i18n/useTranslations";

const DelayOptions = () => {
    const { translations } = useTranslations();
    return (
        <>
            <option value="0">{translations.allTrains}</option>
            <option value="3">3 {translations.minShortened}</option>
            <option value="5">5 {translations.minShortened}</option>
            <option value="10">10 {translations.minShortened}</option>
            <option value="15">15 {translations.minShortened}</option>
            <option value="30">30 {translations.minShortened}</option>
        </>
    );
};

export default DelayOptions;

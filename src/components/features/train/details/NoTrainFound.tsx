import { useTranslations } from "@/lib/i18n/useTranslations";

const NoTrainFound = ({ trainNumber }: { trainNumber: string }) => {
    const { translations } = useTranslations();
    return (
        <div className="flex flex-col items-center">
            <h1 className="px-2 py-8 text-xl text-red-500">
                {translations.noTrainFoundWithNumber.replace("{trainNumber}", trainNumber)}
            </h1>
            <p>{translations.trainNotRunningToday}</p>
            <p className="mt-4 text-sm text-foreground/60">{translations.trySearchWithDate}</p>
        </div>
    );
};

export default NoTrainFound;

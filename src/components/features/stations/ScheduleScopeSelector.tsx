import { useTranslations } from "@/lib/i18n/useTranslations";

type ScheduleScopeSelectorProps = {
    showWholeDay: boolean;
    onChange: (showWholeDay: boolean) => void;
};

const ScheduleScopeSelector = ({ showWholeDay, onChange }: ScheduleScopeSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    return (
        <div className={`flex justify-center ${isLoading ? "fade-out" : "fade-in"}`}>
            <div
                role="group"
                aria-label={translations.schedule}
                className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap rounded-md border border-border overflow-hidden"
            >
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    aria-pressed={!showWholeDay}
                    className={`px-3 py-2 text-sm md:text-base ${
                        !showWholeDay ? "bg-foreground text-background" : "hover:bg-surface-hover"
                    }`}
                >
                    {translations.remainingTrains}
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    aria-pressed={showWholeDay}
                    className={`px-3 py-2 text-sm md:text-base md:border-l border-border ${
                        showWholeDay ? "bg-foreground text-background" : "hover:bg-surface-hover"
                    }`}
                >
                    {translations.wholeDay}
                </button>
            </div>
        </div>
    );
};

export default ScheduleScopeSelector;

import DatePicker from "@/components/common/DatePicker";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { addDays, todayInHelsinki } from "@/lib/utils/dateUtils";

type ScheduleDaySelectorProps = {
    date: string;
    onDateChange: (date: string) => void;
};

const ScheduleDaySelector = ({ date, onDateChange }: ScheduleDaySelectorProps) => {
    const { translations, isLoading } = useTranslations();
    const today = todayInHelsinki();
    const tomorrow = addDays(today, 1);

    return (
        <div className={`space-y-3 w-full max-w-xs mx-auto ${isLoading ? "fade-out" : "fade-in"}`}>
            <div className="flex justify-center">
                <div className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap rounded-md border border-border overflow-hidden">
                    <button
                        type="button"
                        onClick={() => onDateChange(today)}
                        className={`px-3 py-2 text-sm md:text-base ${
                            date === today
                                ? "bg-foreground text-background"
                                : "hover:bg-surface-hover"
                        }`}
                    >
                        {translations.today}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDateChange(tomorrow)}
                        className={`px-3 py-2 text-sm md:text-base md:border-l border-border ${
                            date === tomorrow
                                ? "bg-foreground text-background"
                                : "hover:bg-surface-hover"
                        }`}
                    >
                        {translations.tomorrow}
                    </button>
                </div>
            </div>
            <DatePicker date={date} setDate={onDateChange} />
        </div>
    );
};

export default ScheduleDaySelector;

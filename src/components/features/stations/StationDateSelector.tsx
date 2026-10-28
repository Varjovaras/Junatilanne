import { useTheme } from "@/components/providers/ThemeProvider";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { isToday, todayInHelsinki } from "@/lib/utils/date";

const MIN_DATE = "2017-01-01"; // VR's data starts from around this time

type StationDateSelectorProps = {
    date: string;
    onDateChange: (date: string) => void;
};

const StationDateSelector = ({ date, onDateChange }: StationDateSelectorProps) => {
    const { translations } = useTranslations();
    const { theme } = useTheme();
    const today = todayInHelsinki();
    const maxDate = `${Number(today.slice(0, 4)) + 1}-12-31`;

    return (
        <div className="flex items-center gap-2">
            <input
                type="date"
                aria-label={translations.date}
                value={date}
                min={MIN_DATE}
                max={maxDate}
                style={{ colorScheme: theme }}
                onChange={(event) => {
                    if (event.target.value) {
                        onDateChange(event.target.value);
                    }
                }}
                className="px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
                type="button"
                onClick={() => onDateChange(today)}
                disabled={isToday(date)}
                className="px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface"
            >
                {translations.today}
            </button>
        </div>
    );
};

export default StationDateSelector;

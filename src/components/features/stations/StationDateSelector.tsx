import { useTheme } from "@/components/providers/ThemeProvider";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { todayInHelsinki } from "@/lib/utils/date";

const MIN_DATE = "2017-01-01"; // VR's data starts from around this time

type StationDateSelectorProps = {
    date: string;
    onDateChange: (date: string) => void;
};

const StationDateSelector = ({ date, onDateChange }: StationDateSelectorProps) => {
    const { translations } = useTranslations();
    const { theme } = useTheme();
    const maxDate = `${Number(todayInHelsinki().slice(0, 4)) + 1}-12-31`;

    return (
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
    );
};

export default StationDateSelector;

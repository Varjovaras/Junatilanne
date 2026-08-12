import { useId } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { todayInHelsinki } from "@/lib/utils/dateUtils";

const MIN_YEAR = 2017; // VR's data starts from around this time
const MAX_YEAR_OFFSET = 1;

const selectClassName =
    "flex-1 px-3 py-2 border border-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-surface text-foreground";

type DatePickerProps = {
    date: string;
    setDate: (date: string) => void;
};

const DatePicker = ({ date, setDate }: DatePickerProps) => {
    const { translations } = useTranslations();
    const id = useId();
    const currentYear = Number(todayInHelsinki().slice(0, 4));
    const [year, month, day] = date.split("-").map(Number);

    const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

    const years = [];
    for (let y = MIN_YEAR; y <= currentYear + MAX_YEAR_OFFSET; y++) years.push(y);

    const setDatePart = (part: "year" | "month" | "day", value: number) => {
        const nextYear = part === "year" ? value : year;
        const nextMonth = part === "month" ? value : month;
        const nextDay = Math.min(part === "day" ? value : day, daysInMonth(nextYear, nextMonth));
        const nextDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
        setDate(nextDate);
    };

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium px-2">
                {translations.date}
            </label>
            <div className="flex gap-2">
                <select
                    id={id}
                    value={day}
                    aria-label={translations.day}
                    onChange={(e) => setDatePart("day", Number(e.target.value))}
                    className={selectClassName}
                >
                    {Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
                <select
                    value={month}
                    aria-label={translations.month}
                    onChange={(e) => setDatePart("month", Number(e.target.value))}
                    className={selectClassName}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
                <select
                    value={year}
                    aria-label={translations.year}
                    onChange={(e) => setDatePart("year", Number(e.target.value))}
                    className={selectClassName}
                >
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default DatePicker;

import DatePicker from "@/components/common/DatePicker";
import SegmentedControl from "@/components/common/SegmentedControl";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { addDays, todayInHelsinki } from "@/lib/utils/date";

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
                <SegmentedControl
                    value={date === tomorrow ? "tomorrow" : "today"}
                    onChange={(value) => onDateChange(value === "tomorrow" ? tomorrow : today)}
                    options={[
                        { value: "today", label: translations.today },
                        { value: "tomorrow", label: translations.tomorrow },
                    ]}
                />
            </div>
            <DatePicker date={date} setDate={onDateChange} />
        </div>
    );
};

export default ScheduleDaySelector;

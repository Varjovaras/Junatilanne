import { useTranslations } from "@/lib/i18n/useTranslations";

export type ScheduleView = "upcoming" | "schedule";

type ScheduleViewSelectorProps = {
    view: ScheduleView;
    onViewChange: (view: ScheduleView) => void;
};

const ScheduleViewSelector = ({ view, onViewChange }: ScheduleViewSelectorProps) => {
    const { translations, isLoading } = useTranslations();

    return (
        <div className={`flex justify-center my-4 px-2 ${isLoading ? "fade-out" : "fade-in"}`}>
            <div className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap rounded-md border border-border overflow-hidden">
                <button
                    type="button"
                    onClick={() => onViewChange("upcoming")}
                    className={`px-3 py-2 text-sm md:text-base ${
                        view === "upcoming"
                            ? "bg-foreground text-background"
                            : "hover:bg-surface-hover"
                    }`}
                >
                    {translations.futureTrains}
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange("schedule")}
                    className={`px-3 py-2 text-sm md:text-base md:border-l border-border ${
                        view === "schedule"
                            ? "bg-foreground text-background"
                            : "hover:bg-surface-hover"
                    }`}
                >
                    {translations.schedule}
                </button>
            </div>
        </div>
    );
};

export default ScheduleViewSelector;

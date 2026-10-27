import { useId } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";

type SortField = "trainNumber" | "delay";
type SortDirection = "asc" | "desc";

export type SortOption = {
    field: SortField;
    direction: SortDirection;
};

type SortSelectorProps = {
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
};

const SortSelector = ({ currentSort, onSortChange }: SortSelectorProps) => {
    const { translations, isLoading } = useTranslations();
    const id = useId();

    return (
        <div
            className={`flex flex-wrap items-center gap-2 w-full ${isLoading ? "fade-out" : "fade-in"}`}
        >
            <label htmlFor={id} className="text-sm whitespace-nowrap">
                {translations.sortBy}:
            </label>
            <select
                id={id}
                value={`${currentSort.field}-${currentSort.direction}`}
                onChange={(e) => {
                    const [field, direction] = e.target.value.split("-") as [
                        SortField,
                        SortDirection,
                    ];
                    onSortChange({ field, direction });
                }}
                className="px-2 py-1 rounded-md border border-border bg-surface min-w-[200px] max-w-full"
            >
                <option value="trainNumber-asc">{translations.trainNumberAsc}</option>
                <option value="trainNumber-desc">{translations.trainNumberDesc}</option>
                <option value="delay-asc">{translations.delayAsc}</option>
                <option value="delay-desc">{translations.delayDesc}</option>
            </select>
        </div>
    );
};

export default SortSelector;

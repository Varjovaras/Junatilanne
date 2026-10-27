import { useId } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import DelayOptions from "./DelayOptions";

type DelayThresholdSelectorProps = {
    currentThreshold: number;
    onThresholdChange: (threshold: number) => void;
};

const DelayThresholdSelector = ({
    currentThreshold,
    onThresholdChange,
}: DelayThresholdSelectorProps) => {
    const { translations, isLoading } = useTranslations();
    const id = useId();

    return (
        <div className={`flex items-center gap-2 ${isLoading ? "fade-out" : "fade-in"}`}>
            <label htmlFor={id} className="text-sm">
                {translations.delayThreshold}:
            </label>
            <select
                id={id}
                value={currentThreshold}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
                className="px-2 py-1 rounded-md border border-border bg-surface"
            >
                <DelayOptions />
            </select>
        </div>
    );
};

export default DelayThresholdSelector;

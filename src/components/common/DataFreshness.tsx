import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks/useMounted";
import type { Translations } from "@/lib/i18n/translations";
import { useTranslations } from "@/lib/i18n/useTranslations";

type DataFreshnessProps = {
    dataUpdatedAt: number;
    isFetching?: boolean;
    isError?: boolean;
    onRefresh: () => void;
    className?: string;
};

const formatUpdatedAgo = (
    dataUpdatedAt: number,
    now: number,
    translations: Translations,
): string => {
    const seconds = Math.max(0, Math.floor((now - dataUpdatedAt) / 1000));

    if (seconds < 10) return translations.updatedNow;
    if (seconds < 60) {
        return translations.updatedSecondsAgo.replace("{n}", String(seconds));
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return translations.updatedMinutesAgo.replace("{n}", String(minutes));
    }

    const hours = Math.floor(minutes / 60);
    return translations.updatedHoursAgo.replace("{n}", String(hours));
};

const DataFreshness = ({
    dataUpdatedAt,
    isFetching = false,
    isError = false,
    onRefresh,
    className = "",
}: DataFreshnessProps) => {
    const { translations } = useTranslations();
    const mounted = useMounted();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!mounted) return;

        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1_000);

        return () => clearInterval(timer);
    }, [mounted]);

    const statusText = isError
        ? translations.staleData
        : dataUpdatedAt > 0
          ? formatUpdatedAgo(dataUpdatedAt, now, translations)
          : "";
    const updatedAtTitle =
        dataUpdatedAt > 0 ? new Date(dataUpdatedAt).toLocaleTimeString() : undefined;

    return (
        <div className={`flex items-center gap-2 text-xs ${className}`}>
            {mounted && statusText && (
                <span
                    title={updatedAtTitle}
                    className={isError ? "text-amber-600 font-medium" : "text-foreground/60"}
                >
                    {statusText}
                </span>
            )}
            <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                aria-label={translations.refreshData}
                title={translations.refreshData}
                className="flex items-center justify-center w-7 h-7 rounded-full border border-border text-foreground/70 hover:bg-surface-hover hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-wait"
            >
                <FontAwesomeIcon
                    icon={faRotateRight}
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
            </button>
        </div>
    );
};

export default DataFreshness;

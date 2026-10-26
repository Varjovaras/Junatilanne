import { useTranslations } from "@/lib/i18n/useTranslations";

type StatusPillProps = {
    cancelled: boolean;
    runningCurrently: boolean;
    completed?: boolean;
    className?: string;
};

const StatusPill = ({
    cancelled,
    runningCurrently,
    completed = false,
    className = "px-2 py-1 text-sm",
}: StatusPillProps) => {
    const { translations } = useTranslations();

    const statusClass = cancelled
        ? "bg-red-500/10 text-red-500"
        : completed
          ? "bg-foreground/10 text-foreground/60"
          : runningCurrently
            ? "bg-green-500/10 text-green-500"
            : "bg-yellow-500/10 text-yellow-500";

    const statusText = cancelled
        ? translations.cancelled
        : completed
          ? translations.completed
          : runningCurrently
            ? translations.running
            : translations.scheduled;

    return (
        <span className={`rounded-full whitespace-nowrap ${statusClass} ${className}`.trim()}>
            {statusText}
        </span>
    );
};

export default StatusPill;

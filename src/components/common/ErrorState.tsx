import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslationsSafe } from "@/lib/i18n/useTranslations";

type ErrorStateProps = {
    title?: string;
    description?: string;
    onRetry?: () => void;
    compact?: boolean;
    className?: string;
};

const ErrorState = ({
    title,
    description,
    onRetry,
    compact = false,
    className = "",
}: ErrorStateProps) => {
    const { translations } = useTranslationsSafe();

    return (
        <div
            role="alert"
            className={`flex flex-col items-center justify-center gap-3 text-center ${
                compact ? "p-4" : "p-8"
            } ${className}`}
        >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 shrink-0">
                <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    aria-hidden="true"
                    className="h-4 w-4 text-red-500"
                />
            </span>
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-red-500">
                    {title ?? translations.errorTitle}
                </h2>
                <p className="text-sm text-foreground/70 max-w-md">
                    {description ?? translations.errorGeneric}
                </p>
            </div>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="px-4 py-2 text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    {translations.retry}
                </button>
            )}
        </div>
    );
};

export default ErrorState;

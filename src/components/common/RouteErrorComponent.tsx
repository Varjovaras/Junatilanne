import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import ErrorState from "@/components/common/ErrorState";
import type { Translations } from "@/lib/i18n/translations";
import { useTranslations } from "@/lib/i18n/useTranslations";

type RouteErrorComponentProps = ErrorComponentProps & {
    descriptionKey?: keyof Translations;
};

const RouteErrorComponent = ({
    error,
    reset,
    descriptionKey = "errorGeneric",
}: RouteErrorComponentProps) => {
    const { translations } = useTranslations();
    const router = useRouter();

    useEffect(() => {
        console.error("Route error:", error);
    }, [error]);

    const retry = () => {
        reset();
        void router.invalidate();
    };

    return (
        <ErrorState
            title={translations.errorTitle}
            description={translations[descriptionKey]}
            onRetry={retry}
        />
    );
};

export const createRouteErrorComponent = (descriptionKey: keyof Translations) => {
    const RouteError = ({ error, reset }: ErrorComponentProps) => (
        <RouteErrorComponent error={error} reset={reset} descriptionKey={descriptionKey} />
    );

    return RouteError;
};

export default RouteErrorComponent;

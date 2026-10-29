import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import ErrorState from "@/components/common/ErrorState";

const RootErrorComponent = ({ error, reset }: ErrorComponentProps) => {
    const router = useRouter();

    useEffect(() => {
        // Keep the real error in the console for debugging, but never show
        // implementation details to the user.
        console.error("Unhandled application error:", error);
    }, [error]);

    const retry = reset
        ? () => {
              reset();
              void router.invalidate();
          }
        : undefined;

    return (
        <div className="flex items-center justify-center min-h-screen p-8">
            <title>Junatilanne</title>
            <ErrorState onRetry={retry} />
        </div>
    );
};

export default RootErrorComponent;

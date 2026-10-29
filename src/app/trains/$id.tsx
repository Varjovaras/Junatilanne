import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import DataFreshness from "@/components/common/DataFreshness";
import Loading from "@/components/common/Loading";
import { createRouteErrorComponent } from "@/components/common/RouteErrorComponent";
import LiveTrainPage from "@/components/features/train/details/LiveTrainPage";
import NoTrainFound from "@/components/features/train/details/NoTrainFound";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { trainPageQueryOptions } from "@/lib/queries/train/trainDetails";
import { formatDate } from "@/lib/utils/date";

const TrainErrorComponent = createRouteErrorComponent("errorLoadingTrain");

export const Route = createFileRoute("/trains/$id")({
    loader: async ({ context: { queryClient }, params }) =>
        queryClient.ensureQueryData(trainPageQueryOptions(params.id)),
    pendingComponent: Loading,
    component: TrainRoute,
    errorComponent: TrainErrorComponent,
});

function TrainRoute() {
    const { id } = Route.useParams();
    const { data, isError, isFetching, dataUpdatedAt, refetch } = useSuspenseQuery(
        trainPageQueryOptions(id),
    );
    const { kind, train, distance } = data;
    const { translations } = useTranslations();

    let content: ReactNode;

    if (kind === "invalid") {
        content = <div>{translations.invalidTrainId}</div>;
    } else if (train) {
        content = <LiveTrainPage train={train} distance={distance} />;
    } else if (kind === "date") {
        const [trainNumber, year, month, day] = id.split("-");
        const formattedDate = formatDate(`${year}-${month}-${day}`);

        content = (
            <div className="flex flex-col items-center">
                <h1 className="px-2 py-8 text-xl text-red-500">
                    {translations.noTrainFoundForDate
                        .replace("{trainNumber}", trainNumber)
                        .replace("{date}", formattedDate)}
                </h1>
                <p className="mt-4 text-sm text-foreground/60">{translations.tryDifferentSearch}</p>
            </div>
        );
    } else {
        content = <NoTrainFound trainNumber={id} />;
    }

    return (
        <div>
            {isError && (
                <div className="flex justify-end w-full max-w-6xl mx-auto px-4 mb-2">
                    <DataFreshness
                        dataUpdatedAt={dataUpdatedAt}
                        isFetching={isFetching}
                        isError
                        onRefresh={() => void refetch()}
                    />
                </div>
            )}
            {content}
        </div>
    );
}

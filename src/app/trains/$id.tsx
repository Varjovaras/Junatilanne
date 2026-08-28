import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Loading from "@/components/common/Loading";
import LiveTrainPage from "@/components/features/train-details/LiveTrainPage";
import NoTrainFound from "@/components/features/train-details/NoTrainFound";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { trainDetailsQueryOptions, trainDistanceQueryOptions } from "@/lib/queries/queryOptions";
import { formatDate } from "@/lib/utils/dateUtils";

export const Route = createFileRoute("/trains/$id")({
    loader: async ({ context: { queryClient }, params }) => {
        const details = await queryClient.ensureQueryData(trainDetailsQueryOptions(params.id));

        // Preload the distance data during SSR so the "X km to next station"
        // chips arrive in the initial HTML instead of after a client fetch.
        if (details.train) {
            await queryClient.ensureQueryData(trainDistanceQueryOptions(details.train));
        }

        return details;
    },
    pendingComponent: Loading,
    component: TrainRoute,
});

function TrainRoute() {
    const { id } = Route.useParams();
    const { data } = useSuspenseQuery(trainDetailsQueryOptions(id));
    const { kind, train } = data;
    const { translations } = useTranslations();

    if (kind === "invalid") {
        return <div>{translations.invalidTrainId}</div>;
    }

    if (train) {
        return <LiveTrainPage train={train} />;
    }

    if (kind === "date") {
        const [trainNumber, year, month, day] = id.split("-");
        const formattedDate = formatDate(`${year}-${month}-${day}`);

        return (
            <div className="flex flex-col items-center">
                <h1 className="px-2 py-8 text-xl text-red-500">
                    {translations.noTrainFoundForDate
                        .replace("{trainNumber}", trainNumber)
                        .replace("{date}", formattedDate)}
                </h1>
                <p className="mt-4 text-sm text-foreground/60">{translations.tryDifferentSearch}</p>
            </div>
        );
    }

    return <NoTrainFound trainNumber={id} />;
}

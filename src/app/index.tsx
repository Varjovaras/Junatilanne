import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import DataFreshness from "@/components/common/DataFreshness";
import Loading from "@/components/common/Loading";
import { createRouteErrorComponent } from "@/components/common/RouteErrorComponent";
import TrainDataDisplay from "@/components/features/train/lists/TrainDataDisplay";
import { homeTrainsQueryOptions } from "@/lib/queries/home/homeTrains";

const HomeErrorComponent = createRouteErrorComponent("errorLoadingTrains");

export const Route = createFileRoute("/")({
    component: Home,
    errorComponent: HomeErrorComponent,
});

function Home() {
    return (
        <div className="w-full">
            <ClientOnly
                fallback={
                    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
                        <Loading />
                    </div>
                }
            >
                <HomeContent />
            </ClientOnly>
        </div>
    );
}

function HomeContent() {
    const {
        data: trains,
        isError,
        isFetching,
        dataUpdatedAt,
        refetch,
    } = useSuspenseQuery(homeTrainsQueryOptions());

    return (
        <div className="flex flex-col items-center justify-items-center">
            <div className="w-full flex justify-end px-2 mb-1">
                <DataFreshness
                    dataUpdatedAt={dataUpdatedAt}
                    isFetching={isFetching}
                    isError={isError}
                    onRefresh={() => void refetch()}
                />
            </div>
            <TrainDataDisplay trains={trains} />
        </div>
    );
}

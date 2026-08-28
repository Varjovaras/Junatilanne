import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import Loading from "@/components/common/Loading";
import TrainDataDisplay from "@/components/features/train-lists/TrainDataDisplay";
import { homeTrainsQueryOptions } from "@/lib/queries/queryOptions";

export const Route = createFileRoute("/")({
    component: Home,
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
    const { data: trains } = useSuspenseQuery(homeTrainsQueryOptions());

    return (
        <div className="flex flex-col items-center justify-items-center">
            <TrainDataDisplay trains={trains} />
        </div>
    );
}

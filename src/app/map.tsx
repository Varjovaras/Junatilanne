import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import Loading from "@/components/common/Loading";
import { createRouteErrorComponent } from "@/components/common/RouteErrorComponent";

const TrainMap = lazy(() => import("@/components/features/map/TrainMap"));

const MapErrorComponent = createRouteErrorComponent("errorLoadingMap");

export const Route = createFileRoute("/map")({
    validateSearch: (search: Record<string, unknown>) => ({
        train: typeof search.train === "string" ? search.train : undefined,
    }),
    component: MapRoute,
    errorComponent: MapErrorComponent,
});

function MapRoute() {
    const { train } = Route.useSearch();

    return (
        <ClientOnly fallback={<Loading />}>
            <Suspense fallback={<Loading />}>
                <div className="w-full h-[calc(100vh-200px)] min-h-125 border border-foreground/20 rounded-lg overflow-hidden">
                    <TrainMap trainNumber={train} />
                </div>
                <div className="w-full mt-1 text-[10px] text-foreground/60 text-center">
                    <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">
                        OpenFreeMap
                    </a>
                    {" © "}
                    <a
                        href="https://www.openmaptiles.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        OpenMapTiles
                    </a>
                    {" Data from "}
                    <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        OpenStreetMap
                    </a>
                </div>
            </Suspense>
        </ClientOnly>
    );
}

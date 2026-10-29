import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import DataFreshness from "@/components/common/DataFreshness";
import Loading from "@/components/common/Loading";
import { createRouteErrorComponent } from "@/components/common/RouteErrorComponent";
import TrainDataDisplay from "@/components/features/train/lists/TrainDataDisplay";
import { homeTrainsQueryOptions } from "@/lib/queries/home/homeTrains";
import {
    DEFAULT_TRAIN_CATEGORY,
    isTrainCategoryFilter,
    type TrainCategoryFilter,
} from "@/lib/train/classification";
import { DEFAULT_DELAY_THRESHOLD, parseDelayThreshold } from "@/lib/train/delay";
import {
    DEFAULT_SORT,
    formatSortParam,
    isDefaultSort,
    parseSortParam,
    type SortOption,
} from "@/lib/train/sort";

const HomeErrorComponent = createRouteErrorComponent("errorLoadingTrains");

type HomeSearch = {
    category?: TrainCategoryFilter;
    delay?: number;
    sort?: string;
};

const toHomeSearch = (
    category: TrainCategoryFilter,
    delay: number,
    sort: SortOption,
): HomeSearch => ({
    // Defaults are left out of the URL so shared links stay short.
    ...(category !== DEFAULT_TRAIN_CATEGORY ? { category } : {}),
    ...(delay !== DEFAULT_DELAY_THRESHOLD ? { delay } : {}),
    ...(!isDefaultSort(sort) ? { sort: formatSortParam(sort) } : {}),
});

export const Route = createFileRoute("/")({
    validateSearch: (search: Record<string, unknown>): HomeSearch => {
        const category = isTrainCategoryFilter(search.category) ? search.category : undefined;
        const delay = parseDelayThreshold(search.delay);
        const sort = parseSortParam(search.sort);

        return {
            ...(category && category !== DEFAULT_TRAIN_CATEGORY ? { category } : {}),
            ...(delay !== undefined && delay !== DEFAULT_DELAY_THRESHOLD ? { delay } : {}),
            ...(sort && !isDefaultSort(sort) ? { sort: formatSortParam(sort) } : {}),
        };
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(homeTrainsQueryOptions()),
    pendingComponent: Loading,
    component: Home,
    errorComponent: HomeErrorComponent,
});

function Home() {
    return (
        <div className="w-full">
            <HomeContent />
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
    const { category, delay, sort } = Route.useSearch();
    const navigate = useNavigate();

    // Invalid values can survive in the parsed search, so resolve them here too.
    const selectedCategory = isTrainCategoryFilter(category) ? category : DEFAULT_TRAIN_CATEGORY;
    const delayThreshold = parseDelayThreshold(delay) ?? DEFAULT_DELAY_THRESHOLD;
    const sortOption = parseSortParam(sort) ?? DEFAULT_SORT;

    const updateSearch = (
        nextCategory: TrainCategoryFilter,
        nextDelay: number,
        nextSort: SortOption,
    ) => {
        navigate({
            to: "/",
            search: toHomeSearch(nextCategory, nextDelay, nextSort),
            resetScroll: false,
        });
    };

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
            <TrainDataDisplay
                trains={trains}
                selectedCategory={selectedCategory}
                onCategoryChange={(nextCategory) =>
                    updateSearch(nextCategory, delayThreshold, sortOption)
                }
                delayThreshold={delayThreshold}
                onDelayThresholdChange={(nextDelay) =>
                    updateSearch(selectedCategory, nextDelay, sortOption)
                }
                sortOption={sortOption}
                onSortChange={(nextSort) =>
                    updateSearch(selectedCategory, delayThreshold, nextSort)
                }
            />
        </div>
    );
}

import Selectors from "@/components/features/train/delay/Selectors";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { filterTrainsByDelay } from "@/lib/train/delay";
import { getTrainId } from "@/lib/train/display";
import { sortTrains, type SortOption } from "@/lib/train/sort";
import NoTrains from "./NoTrains";
import TrainRow from "./TrainRow";
import { getLateTrainsTitle, type TrainTypeFilter } from "./trainTypeMessages";

type TrainListProps = {
    trains: TrainType[];
    trainType: TrainTypeFilter;
    delayThreshold: number;
    onDelayThresholdChange: (threshold: number) => void;
    sortOption: SortOption;
    onSortChange: (sort: SortOption) => void;
};

const TrainList = ({
    trains,
    trainType,
    delayThreshold,
    onDelayThresholdChange,
    sortOption,
    onSortChange,
}: TrainListProps) => {
    const { translations, isLoading } = useTranslations();

    const filteredTrains = filterTrainsByDelay(trains, delayThreshold);
    const sortedTrains = sortTrains(filteredTrains, sortOption);

    const title =
        delayThreshold === 0 ? translations.allTrains : getLateTrainsTitle(trainType, translations);

    return (
        <div className={`p-2 space-y-4 w-full ${isLoading ? "fade-out" : "fade-in"}`}>
            <h2 className="text-left text-2xl">
                {title}
                {delayThreshold > 0 ? (
                    <>
                        {" "}
                        ({delayThreshold}
                        {translations.minutesOrMore})
                    </>
                ) : null}
            </h2>

            <div>
                {sortedTrains.length < 1 ? (
                    <NoTrains
                        trainType={trainType}
                        delayThreshold={delayThreshold}
                        onDelayThresholdChange={onDelayThresholdChange}
                    />
                ) : (
                    <>
                        <Selectors
                            delayThreshold={delayThreshold}
                            onDelayThresholdChange={onDelayThresholdChange}
                            sortOption={sortOption}
                            onSortChange={onSortChange}
                        />
                        <div className="space-y-2 w-full">
                            {sortedTrains.map((train) => (
                                <TrainRow key={getTrainId(train)} train={train} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainList;

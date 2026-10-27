import { useState } from "react";
import type { SortOption } from "@/components/features/train/delay/SortSelector";
import Selectors from "@/components/features/train/delay/Selectors";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { filterTrainsByDelay } from "@/lib/train/delay";
import { getTrainId } from "@/lib/train/display";
import { sortTrains } from "@/lib/train/sort";
import NoTrains from "./NoTrains";
import TrainRow from "./TrainRow";
import { getLateTrainsTitle, type TrainTypeFilter } from "./trainTypeMessages";

type TrainListProps = {
    trains: TrainType[];
    trainType: TrainTypeFilter;
};

const TrainList = ({ trains, trainType }: TrainListProps) => {
    const { translations, isLoading } = useTranslations();
    const [delayThreshold, setDelayThreshold] = useState(0);
    const [sortOption, setSortOption] = useState<SortOption>({
        field: "delay",
        direction: "desc",
    });

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
                        setDelayThreshold={setDelayThreshold}
                    />
                ) : (
                    <>
                        <Selectors
                            delayThreshold={delayThreshold}
                            setDelayThreshold={setDelayThreshold}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
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

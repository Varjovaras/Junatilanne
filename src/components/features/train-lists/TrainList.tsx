import { useState } from "react";
import type { SortOption } from "@/components/features/delay-info/SortSelector";
import Selectors from "@/components/features/delay-info/Selectors";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { TrainType } from "@/lib/types/trainTypes";
import { filterTrainsByDelay } from "@/lib/utils/trainDelay";
import { getTrainId } from "@/lib/utils/trainDisplay";
import { sortTrains } from "@/lib/utils/trainUtils";
import NoTrains from "./NoTrains";
import TrainRow from "./TrainRow";

type TrainListProps = {
    trains: TrainType[];
    trainType: "commuter" | "longDistance" | "freight" | "all";
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

    const getTitle = () => {
        if (delayThreshold === 0) return translations.allTrains;
        switch (trainType) {
            case "commuter":
                return translations.lateCommuter;
            case "longDistance":
                return translations.lateLongDistance;
            case "freight":
                return translations.lateFreight;
            default:
                return translations.lateTrains;
        }
    };

    return (
        <div className={`p-2 space-y-4 w-full ${isLoading ? "fade-out" : "fade-in"}`}>
            <h2 className="text-left text-2xl">
                {getTitle()}
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

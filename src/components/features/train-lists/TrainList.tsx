import { useState } from "react";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import type { ViewMode } from "@/components/common/ViewModeToggle";
import Selectors from "@/components/features/delay-info/Selectors";
import type { SortOption } from "@/components/features/delay-info/SortSelector";
import Train from "@/components/features/train-details/Train";
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
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
};

const TrainList = ({ trains, trainType, view, onViewChange }: TrainListProps) => {
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                <ViewModeToggle view={view} onViewChange={onViewChange} />
            </div>

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
                        {view === "card" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                {sortedTrains.map((train) => (
                                    <Train train={train} key={getTrainId(train)} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 w-full">
                                {sortedTrains.map((train) => (
                                    <TrainRow key={getTrainId(train)} train={train} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainList;

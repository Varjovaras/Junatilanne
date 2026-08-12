import { useState } from "react";
import TrainTypeSelector from "@/components/features/train-lists/TrainTypeSelector";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { stationScheduleFilter } from "@/lib/utils/stationScheduleFilter";
import { filterSchedulesByCategory } from "@/lib/utils/trainClassification";
import ScheduleList from "./ScheduleList";
import TrackSelector from "./TrackSelector";

type ScheduleOverviewProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const ScheduleOverview = ({ schedules, stationId }: ScheduleOverviewProps) => {
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("passengerCommuter");
    const filteredSchedules = stationScheduleFilter(schedules, stationId);

    const filterByTrack = (trains: StationSchedule[]) => {
        if (!selectedTrack) return trains;
        return trains.filter((train) =>
            train.timeTableRows.some(
                (row) =>
                    row.stationShortCode === stationId && row.commercialTrack === selectedTrack,
            ),
        );
    };

    const categoryFilteredSchedules = filterSchedulesByCategory(
        filteredSchedules,
        selectedCategory as "all" | "commuter" | "longDistance" | "freight" | "passengerCommuter",
    );
    const displayedSchedules = filterByTrack(categoryFilteredSchedules);

    return (
        <div className="space-y-8">
            <TrainTypeSelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <TrackSelector
                schedules={schedules}
                stationId={stationId}
                onTrackSelect={setSelectedTrack}
            />

            <ScheduleList schedules={displayedSchedules} stationId={stationId} />
        </div>
    );
};

export default ScheduleOverview;

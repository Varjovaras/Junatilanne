import { useState } from "react";
import TrainTypeSelector from "@/components/features/train-lists/TrainTypeSelector";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { findStationDepartureWithId } from "@/lib/utils/scheduleUtils";
import { stationScheduleFilter } from "@/lib/utils/stationScheduleFilter";
import { filterSchedulesByCategory } from "@/lib/utils/trainClassification";
import { findStationArrivalWithId } from "@/lib/utils/trainStations";
import DailySchedule from "./DailySchedule";
import ScheduleList from "./ScheduleList";
import ScheduleViewSelector, { type ScheduleView } from "./ScheduleViewSelector";
import TrackSelector from "./TrackSelector";

type ScheduleOverviewProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const ScheduleOverview = ({ schedules, stationId }: ScheduleOverviewProps) => {
    const [view, setView] = useState<ScheduleView>("upcoming");
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

    const stationSchedules = schedules.filter(
        (schedule) =>
            findStationDepartureWithId(schedule, stationId) ||
            findStationArrivalWithId(schedule, stationId),
    );

    return (
        <div className="space-y-8">
            <ScheduleViewSelector view={view} onViewChange={setView} />

            {view === "upcoming" ? (
                <>
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
                </>
            ) : (
                <DailySchedule schedules={stationSchedules} stationId={stationId} />
            )}
        </div>
    );
};

export default ScheduleOverview;

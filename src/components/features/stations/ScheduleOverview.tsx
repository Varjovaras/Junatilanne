import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import TrainTypeSelector from "@/components/common/TrainTypeSelector";
import { stationScheduleByDateQueryOptions } from "@/lib/queries/station/stationSchedules";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { isToday, todayInHelsinki } from "@/lib/utils/date";
import type { StationRowType } from "@/lib/station/schedule";
import {
    getStationDayEntries,
    getUpcomingStationEntries,
    type StationScheduleEntry,
} from "@/lib/station/scheduleFilter";
import {
    filterScheduleEntriesByCategory,
    type TrainCategoryFilter,
} from "@/lib/train/classification";
import ScheduleList from "./ScheduleList";
import ScheduleViewSelector, { type ScheduleView } from "./ScheduleViewSelector";
import StationDateSelector from "./StationDateSelector";
import TrackSelector from "./TrackSelector";

type ScheduleOverviewProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
    eventType: StationRowType;
    view: ScheduleView;
    onDateChange: (date: string) => void;
    onViewChange: (view: ScheduleView) => void;
};

const ScheduleOverview = ({
    schedules,
    stationId,
    date,
    eventType,
    view,
    onDateChange,
    onViewChange,
}: ScheduleOverviewProps) => {
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<TrainCategoryFilter>("all");
    const today = todayInHelsinki();
    const scheduleDate = date ?? today;
    const isTodaySchedule = isToday(scheduleDate);
    const now = Date.now();

    const { data: dateData, isLoading } = useQuery({
        ...stationScheduleByDateQueryOptions(stationId, scheduleDate),
        enabled: !isTodaySchedule,
    });
    const daySchedules = isTodaySchedule ? schedules : (dateData?.schedules ?? []);

    const filterByTrack = (entries: StationScheduleEntry[]) => {
        if (!selectedTrack) return entries;
        return entries.filter((entry) => entry.row.commercialTrack === selectedTrack);
    };

    const filterEntries = (entries: StationScheduleEntry[]) =>
        filterByTrack(filterScheduleEntriesByCategory(entries, selectedCategory));

    const getEntries = (type: StationRowType) =>
        filterEntries(
            isTodaySchedule
                ? getUpcomingStationEntries(schedules, stationId, type, now)
                : getStationDayEntries(daySchedules, stationId, type),
        );

    const arrivalEntries = getEntries("ARRIVAL");
    const departureEntries = getEntries("DEPARTURE");
    const entries = view === "arrivals" ? arrivalEntries : departureEntries;

    return (
        <div className="space-y-8">
            <TrainTypeSelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <div className="flex flex-wrap items-center justify-center gap-2">
                <TrackSelector
                    schedules={daySchedules}
                    stationId={stationId}
                    selectedTrack={selectedTrack}
                    onTrackSelect={setSelectedTrack}
                />
                <StationDateSelector date={scheduleDate} onDateChange={onDateChange} />
            </div>

            <ScheduleViewSelector
                view={view}
                onViewChange={onViewChange}
                arrivalCount={arrivalEntries.length}
                departureCount={departureEntries.length}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loading />
                </div>
            ) : (
                <ScheduleList
                    key={`${scheduleDate}-${view}-${selectedCategory}-${selectedTrack ?? "all"}`}
                    entries={entries}
                    stationId={stationId}
                    eventType={eventType}
                    date={scheduleDate}
                />
            )}
        </div>
    );
};

export default ScheduleOverview;

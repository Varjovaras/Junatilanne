import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import DailySchedule from "./DailySchedule";
import ScheduleDaySelector from "./ScheduleDaySelector";
import ScheduleEventTypeSelector from "./ScheduleEventTypeSelector";
import ScheduleList from "./ScheduleList";
import ScheduleScopeSelector from "./ScheduleScopeSelector";
import ScheduleViewSelector, { type ScheduleView } from "./ScheduleViewSelector";
import TrackSelector from "./TrackSelector";

type ScheduleOverviewProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
    eventType: StationRowType;
    view: ScheduleView;
    onDateChange: (date?: string) => void;
    onViewChange: (view: ScheduleView) => void;
    onEventTypeChange: (eventType: StationRowType) => void;
};

const ScheduleOverview = ({
    schedules,
    stationId,
    date,
    eventType,
    view,
    onDateChange,
    onViewChange,
    onEventTypeChange,
}: ScheduleOverviewProps) => {
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<TrainCategoryFilter>("all");
    const [showWholeDay, setShowWholeDay] = useState(false);
    const today = todayInHelsinki();
    const scheduleDate = date ?? today;
    const isTodaySchedule = isToday(scheduleDate);
    const now = Date.now();

    useEffect(() => {
        setShowWholeDay(false);
    }, [date]);

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

    const arrivalEntries = filterEntries(
        getUpcomingStationEntries(schedules, stationId, "ARRIVAL", now),
    );
    const departureEntries = filterEntries(
        getUpcomingStationEntries(schedules, stationId, "DEPARTURE", now),
    );
    const dayEntries = filterEntries(getStationDayEntries(daySchedules, stationId, eventType));
    const visibleDayEntries =
        isTodaySchedule && !showWholeDay
            ? dayEntries.filter((entry) => entry.time >= now)
            : dayEntries;

    return (
        <div className="space-y-8">
            <TrainTypeSelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <TrackSelector
                schedules={daySchedules}
                stationId={stationId}
                selectedTrack={selectedTrack}
                onTrackSelect={setSelectedTrack}
            />

            <ScheduleViewSelector
                view={view}
                onViewChange={onViewChange}
                arrivalCount={arrivalEntries.length}
                departureCount={departureEntries.length}
                scheduleCount={visibleDayEntries.length}
            />

            {view === "schedule" ? (
                <>
                    <div className="space-y-4">
                        <ScheduleEventTypeSelector
                            eventType={eventType}
                            onChange={onEventTypeChange}
                        />
                        <ScheduleDaySelector date={scheduleDate} onDateChange={onDateChange} />
                        {isTodaySchedule && (
                            <ScheduleScopeSelector
                                showWholeDay={showWholeDay}
                                onChange={setShowWholeDay}
                            />
                        )}
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loading />
                        </div>
                    ) : (
                        <DailySchedule
                            key={`day-${scheduleDate}-${eventType}-${selectedCategory}-${
                                selectedTrack ?? "all"
                            }-${showWholeDay ? "all" : "remaining"}`}
                            entries={visibleDayEntries}
                            stationId={stationId}
                            eventType={eventType}
                            date={scheduleDate}
                            isFiltered={isTodaySchedule && !showWholeDay}
                            hasDaySchedules={daySchedules.length > 0}
                        />
                    )}
                </>
            ) : (
                <ScheduleList
                    key={`${view}-${eventType}-${selectedCategory}-${selectedTrack ?? "all"}`}
                    entries={view === "arrivals" ? arrivalEntries : departureEntries}
                    stationId={stationId}
                    eventType={eventType}
                />
            )}
        </div>
    );
};

export default ScheduleOverview;

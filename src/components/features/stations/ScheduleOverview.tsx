import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import TrainTypeSelector from "@/components/features/train/shared/TrainTypeSelector";
import { stationScheduleByDateQueryOptions } from "@/lib/queries/station/stationSchedules";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { isToday, todayInHelsinki } from "@/lib/utils/date";
import {
    filterSchedulesWithUpcomingStop,
    stationScheduleFilter,
} from "@/lib/station/scheduleFilter";
import { filterSchedulesByCategory } from "@/lib/train/classification";
import DailySchedule from "./DailySchedule";
import ScheduleDaySelector from "./ScheduleDaySelector";
import ScheduleList from "./ScheduleList";
import ScheduleScopeSelector from "./ScheduleScopeSelector";
import ScheduleViewSelector, { type ScheduleView } from "./ScheduleViewSelector";
import TrackSelector from "./TrackSelector";

type ScheduleOverviewProps = {
    schedules: StationSchedule[];
    stationId: string;
    date?: string;
    onDateChange: (date?: string) => void;
};

const CATEGORIES = ["all", "commuter", "longDistance", "freight", "passengerCommuter"] as const;

const ScheduleOverview = ({ schedules, stationId, date, onDateChange }: ScheduleOverviewProps) => {
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("passengerCommuter");
    const [lastScheduleDate, setLastScheduleDate] = useState<string | undefined>(undefined);
    const [showWholeDay, setShowWholeDay] = useState(false);
    const view: ScheduleView = date ? "schedule" : "upcoming";
    const today = todayInHelsinki();
    const scheduleDate = date ?? today;
    const isTodaySchedule = isToday(scheduleDate);

    if (date && date !== lastScheduleDate) {
        setLastScheduleDate(date);
    }

    useEffect(() => {
        setShowWholeDay(false);
    }, [date]);

    const { data: dateData, isLoading } = useQuery({
        ...stationScheduleByDateQueryOptions(stationId, scheduleDate),
        enabled: !isTodaySchedule,
    });
    const daySchedules = isTodaySchedule ? schedules : (dateData?.schedules ?? []);

    const filterByTrack = (trains: StationSchedule[]) => {
        if (!selectedTrack) return trains;
        return trains.filter((train) =>
            train.timeTableRows.some(
                (row) =>
                    row.stationShortCode === stationId && row.commercialTrack === selectedTrack,
            ),
        );
    };

    const category = selectedCategory as (typeof CATEGORIES)[number];

    const upcomingSchedules = stationScheduleFilter(schedules, stationId);
    const displayedSchedules = filterByTrack(
        filterSchedulesByCategory(upcomingSchedules, category),
    );
    const displayedDaySchedules = filterByTrack(filterSchedulesByCategory(daySchedules, category));
    const visibleDaySchedules =
        isTodaySchedule && !showWholeDay
            ? filterSchedulesWithUpcomingStop(displayedDaySchedules, stationId)
            : displayedDaySchedules;

    return (
        <div className="space-y-8">
            <TrainTypeSelector
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <TrackSelector
                schedules={daySchedules}
                stationId={stationId}
                onTrackSelect={setSelectedTrack}
            />

            <ScheduleViewSelector
                view={view}
                onViewChange={(nextView) =>
                    onDateChange(nextView === "upcoming" ? undefined : (lastScheduleDate ?? today))
                }
                upcomingCount={displayedSchedules.length}
                scheduleCount={visibleDaySchedules.length}
            />

            {view === "upcoming" ? (
                <ScheduleList
                    key={`upcoming-${selectedCategory}-${selectedTrack ?? "all"}`}
                    schedules={displayedSchedules}
                    stationId={stationId}
                />
            ) : (
                <>
                    <div className="space-y-4">
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
                            key={`day-${scheduleDate}-${selectedCategory}-${selectedTrack ?? "all"}-${
                                showWholeDay ? "all" : "remaining"
                            }`}
                            schedules={visibleDaySchedules}
                            stationId={stationId}
                            date={scheduleDate}
                            isFiltered={isTodaySchedule && !showWholeDay}
                            hasDaySchedules={daySchedules.length > 0}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ScheduleOverview;

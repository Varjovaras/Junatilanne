import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TrainTypeSelector from "@/components/features/train-lists/TrainTypeSelector";
import Loading from "@/components/common/Loading";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { isToday, todayInHelsinki } from "@/lib/utils/dateUtils";
import { stationScheduleByDateQueryOptions } from "@/lib/queries/queryOptions";
import { stationScheduleFilter } from "@/lib/utils/stationScheduleFilter";
import { filterSchedulesByCategory } from "@/lib/utils/trainClassification";
import DailySchedule from "./DailySchedule";
import ScheduleDaySelector from "./ScheduleDaySelector";
import ScheduleList from "./ScheduleList";
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
    const view: ScheduleView = date ? "schedule" : "upcoming";
    const today = todayInHelsinki();
    const scheduleDate = date ?? today;

    if (date && date !== lastScheduleDate) {
        setLastScheduleDate(date);
    }

    const { data: dateData, isLoading } = useQuery({
        ...stationScheduleByDateQueryOptions(stationId, scheduleDate),
        enabled: !isToday(scheduleDate),
    });
    const daySchedules = isToday(scheduleDate) ? schedules : (dateData?.schedules ?? []);

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

            <ScheduleViewSelector
                view={view}
                onViewChange={(nextView) =>
                    onDateChange(nextView === "upcoming" ? undefined : (lastScheduleDate ?? today))
                }
                upcomingCount={displayedSchedules.length}
                scheduleCount={displayedDaySchedules.length}
            />

            {view === "upcoming" ? (
                <ScheduleList schedules={displayedSchedules} stationId={stationId} />
            ) : (
                <>
                    <ScheduleDaySelector date={scheduleDate} onDateChange={onDateChange} />
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loading />
                        </div>
                    ) : (
                        <DailySchedule
                            schedules={displayedDaySchedules}
                            stationId={stationId}
                            date={scheduleDate}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ScheduleOverview;

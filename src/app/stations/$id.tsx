import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Loading from "@/components/common/Loading";
import ScheduleOverview from "@/components/features/stations/ScheduleOverview";
import { isValidStationCode, majorStations } from "@/lib/utils/majorStations";
import { isToday } from "@/lib/utils/dateUtils";
import {
    stationScheduleByDateQueryOptions,
    stationSchedulesQueryOptions,
} from "@/lib/queries/queryOptions";
import { removeAsema } from "@/lib/utils/stringUtils";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/stations/$id")({
    validateSearch: (search: Record<string, unknown>): { date?: string } => {
        const date =
            typeof search.date === "string" && DATE_PATTERN.test(search.date)
                ? search.date
                : undefined;
        return date ? { date } : {};
    },
    loader: ({ context: { queryClient }, params, location }) => {
        queryClient.ensureQueryData(stationSchedulesQueryOptions(params.id));
        const date = (location.search as { date?: string }).date;
        if (date && !isToday(date)) {
            queryClient.ensureQueryData(stationScheduleByDateQueryOptions(params.id, date));
        }
    },
    pendingComponent: Loading,
    component: StationRoute,
});

function StationRoute() {
    const { id } = Route.useParams();
    const { date } = Route.useSearch();
    const navigate = useNavigate();
    const { data } = useSuspenseQuery(stationSchedulesQueryOptions(id));
    const { stationId, schedules } = data;
    const stationName = isValidStationCode(stationId) ? majorStations[stationId] : stationId;

    const handleDateChange = (newDate?: string) => {
        navigate({
            to: "/stations/$id",
            params: { id: stationId },
            search: newDate ? { date: newDate } : {},
        });
    };

    return (
        <div className="mx-auto max-w-7xl p-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-green-500">
                {removeAsema(stationName)}
            </h2>
            <ScheduleOverview
                schedules={schedules}
                stationId={stationId}
                date={date}
                onDateChange={handleDateChange}
            />
        </div>
    );
}

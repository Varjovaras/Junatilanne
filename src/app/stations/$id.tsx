import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Loading from "@/components/common/Loading";
import ScheduleOverview from "@/components/features/stations/ScheduleOverview";
import type { ScheduleView } from "@/components/features/stations/ScheduleViewSelector";
// import { useTranslations } from "@/lib/i18n/useTranslations";
import { isValidStationCode, majorStations } from "@/lib/station/majorStations";
import type { StationRowType } from "@/lib/station/schedule";
import { isToday } from "@/lib/utils/date";
import {
    stationScheduleByDateQueryOptions,
    stationSchedulesQueryOptions,
} from "@/lib/queries/station/stationSchedules";
import { removeAsema } from "@/lib/utils/string";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VIEW_VALUES = ["arrivals", "departures"] as const;

type StationView = (typeof VIEW_VALUES)[number];

type StationSearch = {
    date?: string;
    view?: StationView;
};

const isStationView = (value: unknown): value is StationView =>
    VIEW_VALUES.some((view) => view === value);

export const Route = createFileRoute("/stations/$id")({
    validateSearch: (search: Record<string, unknown>): StationSearch => {
        const date =
            typeof search.date === "string" && DATE_PATTERN.test(search.date)
                ? search.date
                : undefined;
        const view = isStationView(search.view) ? search.view : undefined;

        return {
            ...(date ? { date } : {}),
            ...(view ? { view } : {}),
        };
    },
    loader: async ({ context: { queryClient }, params, location }) => {
        const date = (location.search as { date?: string }).date;

        if (date && !isToday(date)) {
            await queryClient.ensureQueryData(stationScheduleByDateQueryOptions(params.id, date));
            return;
        }

        await queryClient.ensureQueryData(stationSchedulesQueryOptions(params.id));
    },
    pendingComponent: Loading,
    component: StationRoute,
});

function StationRoute() {
    const { id } = Route.useParams();
    const { date, view: viewParam } = Route.useSearch();
    const navigate = useNavigate();
    const { data } = useQuery({
        ...stationSchedulesQueryOptions(id),
        enabled: !date || isToday(date),
    });
    const stationId = data?.stationId ?? id.toUpperCase();
    const schedules = data?.schedules ?? [];
    // const { translations } = useTranslations();
    const stationName = isValidStationCode(stationId) ? majorStations[stationId] : stationId;

    const view: ScheduleView = viewParam ?? "departures";
    const eventType: StationRowType = view === "arrivals" ? "ARRIVAL" : "DEPARTURE";

    const navigateTo = (search: { date?: string; view: ScheduleView }) => {
        const searchDate = search.date && !isToday(search.date) ? search.date : undefined;

        navigate({
            to: "/stations/$id",
            params: { id: stationId },
            search: {
                ...(searchDate ? { date: searchDate } : {}),
                view: search.view,
            },
        });
    };

    const handleDateChange = (newDate: string) => {
        navigateTo({ date: newDate, view });
    };

    const handleViewChange = (nextView: ScheduleView) => {
        navigateTo({ date, view: nextView });
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
                eventType={eventType}
                view={view}
                onDateChange={handleDateChange}
                onViewChange={handleViewChange}
            />
        </div>
    );
}

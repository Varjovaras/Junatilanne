import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import Loading from "@/components/common/Loading";
import ScheduleOverview from "@/components/features/stations/ScheduleOverview";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { isValidStationCode, majorStations } from "@/lib/station/majorStations";
import { isToday } from "@/lib/utils/date";
import {
    stationScheduleByDateQueryOptions,
    stationSchedulesQueryOptions,
} from "@/lib/queries/station/stationSchedules";
import { removeAsema } from "@/lib/utils/string";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/stations/$id")({
    validateSearch: (search: Record<string, unknown>): { date?: string } => {
        const date =
            typeof search.date === "string" && DATE_PATTERN.test(search.date)
                ? search.date
                : undefined;
        return date ? { date } : {};
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
    const { date } = Route.useSearch();
    const navigate = useNavigate();
    const { data } = useQuery({
        ...stationSchedulesQueryOptions(id),
        enabled: !date || isToday(date),
    });
    const stationId = data?.stationId ?? id.toUpperCase();
    const schedules = data?.schedules ?? [];
    const { translations } = useTranslations();
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
            <h2 className="text-3xl font-bold mb-2 text-center text-green-500">
                {removeAsema(stationName)}
            </h2>
            <div className="mb-8 text-center">
                <Link
                    to="/station-messages/$id"
                    params={{ id: stationId }}
                    className="text-sm text-foreground/60 hover:text-foreground hover:underline"
                >
                    {translations.messagesForStation.replace("{station}", removeAsema(stationName))}
                </Link>
            </div>
            <ScheduleOverview
                schedules={schedules}
                stationId={stationId}
                date={date}
                onDateChange={handleDateChange}
            />
        </div>
    );
}

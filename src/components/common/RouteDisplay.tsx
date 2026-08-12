import { Link } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/useTranslations";

export type RouteStationInfo = {
    name: string;
    shortCode: string;
    time?: string;
};

type RouteDisplayProps = {
    start: RouteStationInfo;
    end: RouteStationInfo;
    isAirportLine?: boolean;
    variant?: "default" | "details" | "list" | "compact";
};

const AIRPORT_STATION_CODE = "LEN";

const RouteDisplay = ({
    start,
    end,
    isAirportLine = false,
    variant = "default",
}: RouteDisplayProps) => {
    const { translations } = useTranslations();

    if (isAirportLine && variant === "details") {
        return (
            <div className="text-lg sm:text-2xl text-foreground/70 flex items-center justify-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: start.shortCode }}
                        className="text-green-500"
                    >
                        {start.name}
                    </Link>
                    {start.time && <span className="text-sm text-foreground/60">{start.time}</span>}
                </div>
                <span className="mx-2">→</span>
                <div className="flex flex-col items-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: AIRPORT_STATION_CODE }}
                        className="text-blue-500"
                    >
                        {translations.airport}
                    </Link>
                </div>
                <span className="mx-2">→</span>
                <div className="flex flex-col items-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: end.shortCode }}
                        className="text-blue-500"
                    >
                        {end.name}
                    </Link>
                    {end.time && <span className="text-sm text-foreground/60">{end.time}</span>}
                </div>
            </div>
        );
    }

    if (isAirportLine && (variant === "list" || variant === "compact")) {
        return (
            <div className="grid w-full max-w-md mx-auto grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 text-sm">
                <div className="min-w-0">
                    <Link
                        to="/stations/$id"
                        params={{ id: start.shortCode }}
                        className="block truncate text-green-500"
                    >
                        {start.name}
                    </Link>
                </div>
                <span className="justify-self-center">→</span>
                <div className="min-w-0 text-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: AIRPORT_STATION_CODE }}
                        className="block truncate text-blue-500"
                    >
                        {translations.airport}
                    </Link>
                </div>
                <span className="justify-self-center">→</span>
                <div className="min-w-0 text-right">
                    <Link
                        to="/stations/$id"
                        params={{ id: end.shortCode }}
                        className="block truncate text-green-500"
                    >
                        {end.name}
                    </Link>
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <p className="text-sm">
                <Link
                    to="/stations/$id"
                    params={{ id: start.shortCode }}
                    className="text-green-500"
                    preload={false}
                >
                    {start.name}
                </Link>
                <span className="mx-2">→</span>
                <Link
                    to="/stations/$id"
                    params={{ id: end.shortCode }}
                    className="text-blue-500"
                    preload={false}
                >
                    {end.name}
                </Link>
            </p>
        );
    }

    if (variant === "list") {
        return (
            <div className="grid w-full max-w-md mx-auto grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-4 text-xl">
                <div className="min-w-0 flex flex-col items-start">
                    <Link
                        to="/stations/$id"
                        params={{ id: start.shortCode }}
                        className="block max-w-full truncate text-green-500 hover:underline"
                    >
                        {start.name}
                    </Link>
                    {start.time && <span className="text-xs text-foreground/60">{start.time}</span>}
                </div>
                <span className="justify-self-center text-gray-400">→</span>
                <div className="min-w-0 flex flex-col items-end text-right">
                    <Link
                        to="/stations/$id"
                        params={{ id: end.shortCode }}
                        className="block max-w-full truncate text-blue-500 hover:underline"
                    >
                        {end.name}
                    </Link>
                    {end.time && <span className="text-xs text-foreground/60">{end.time}</span>}
                </div>
            </div>
        );
    }

    if (variant === "details") {
        return (
            <div className="text-2xl text-foreground/70 flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: start.shortCode }}
                        className="text-green-500"
                    >
                        {start.name}
                    </Link>
                    {start.time && <span className="text-sm text-foreground/60">{start.time}</span>}
                </div>
                <span>→</span>
                <div className="flex flex-col items-center">
                    <Link
                        to="/stations/$id"
                        params={{ id: end.shortCode }}
                        className="text-blue-500"
                    >
                        {end.name}
                    </Link>
                    {end.time && <span className="text-sm text-foreground/60">{end.time}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-4 text-xl">
            <div className="flex flex-col items-center">
                <Link
                    to="/stations/$id"
                    params={{ id: start.shortCode }}
                    className="text-green-500 shrink-0 hover:underline"
                >
                    {start.name}
                </Link>
                {start.time && <span className="text-xs text-foreground/60">{start.time}</span>}
            </div>
            <span className="text-gray-400 shrink-0">→</span>
            <div className="flex flex-col items-center">
                <Link
                    to="/stations/$id"
                    params={{ id: end.shortCode }}
                    className="text-blue-500 shrink-0 hover:underline"
                >
                    {end.name}
                </Link>
                {end.time && <span className="text-xs text-foreground/60">{end.time}</span>}
            </div>
        </div>
    );
};

export default RouteDisplay;

import { Link } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/useTranslations";

type RouteStationInfo = {
    name: string;
    shortCode: string;
    time?: string;
};

type RouteDisplayProps = {
    start: RouteStationInfo;
    end: RouteStationInfo;
    airport?: RouteStationInfo;
    isAirportLine?: boolean;
    variant?: "default" | "details" | "list" | "compact";
};

const AIRPORT_STATION_CODE = "LEN";

type RouteStationLinkProps = {
    station: RouteStationInfo;
    colorClass: string;
    className?: string;
    displayName?: string;
    displayShortCode?: string;
    preload?: false;
};

const RouteStationLink = ({
    station,
    colorClass,
    className,
    displayName,
    displayShortCode,
    preload,
}: RouteStationLinkProps) => (
    <Link
        to="/stations/$id"
        params={{ id: displayShortCode ?? station.shortCode }}
        className={`${colorClass}${className ? ` ${className}` : ""}`}
        preload={preload}
        onClick={(event) => event.stopPropagation()}
    >
        {displayName ?? station.name}
    </Link>
);

type RouteStationProps = Omit<RouteStationLinkProps, "preload"> & {
    containerClassName?: string;
    timeClassName?: string;
};

const RouteStation = ({
    station,
    containerClassName,
    timeClassName,
    ...linkProps
}: RouteStationProps) => (
    <div className={containerClassName}>
        <RouteStationLink station={station} {...linkProps} />
        {station.time && <span className={timeClassName}>{station.time}</span>}
    </div>
);

const AirportRoute = ({
    start,
    end,
    airport,
}: Pick<RouteDisplayProps, "start" | "end" | "airport">) => {
    const { translations } = useTranslations();

    return (
        <>
            <RouteStation
                station={start}
                containerClassName="flex flex-col items-center"
                colorClass="text-green-500"
                timeClassName="text-sm text-foreground/60"
            />
            <span className="mx-2">→</span>
            <RouteStation
                station={airport ?? { name: translations.airport, shortCode: AIRPORT_STATION_CODE }}
                containerClassName="flex flex-col items-center"
                colorClass="text-blue-500"
                displayName={translations.airport}
                timeClassName="text-sm text-foreground/60"
            />
            <span className="mx-2">→</span>
            <RouteStation
                station={end}
                containerClassName="flex flex-col items-center"
                colorClass="text-blue-500"
                timeClassName="text-sm text-foreground/60"
            />
        </>
    );
};

const AirportRouteCompact = ({
    start,
    end,
    airport,
}: Pick<RouteDisplayProps, "start" | "end" | "airport">) => {
    const { translations } = useTranslations();

    return (
        <>
            <RouteStation
                station={start}
                containerClassName="min-w-0"
                colorClass="text-green-500"
                className="block truncate"
                timeClassName="block text-xs text-foreground/60"
            />
            <span className="justify-self-center">→</span>
            <RouteStation
                station={airport ?? { name: translations.airport, shortCode: AIRPORT_STATION_CODE }}
                containerClassName="min-w-0 text-center"
                colorClass="text-blue-500"
                className="block truncate"
                displayName={translations.airport}
                timeClassName="block text-xs text-foreground/60"
            />
            <span className="justify-self-center">→</span>
            <RouteStation
                station={end}
                containerClassName="min-w-0 text-right"
                colorClass="text-green-500"
                className="block truncate"
                timeClassName="block text-xs text-foreground/60"
            />
        </>
    );
};

const RouteDisplay = ({
    start,
    end,
    airport,
    isAirportLine = false,
    variant = "default",
}: RouteDisplayProps) => {
    if (isAirportLine && variant === "details") {
        return (
            <div className="text-lg sm:text-2xl text-foreground/70 flex items-center justify-center gap-2 sm:gap-4">
                <AirportRoute start={start} end={end} airport={airport} />
            </div>
        );
    }

    if (isAirportLine && (variant === "list" || variant === "compact")) {
        return (
            <div className="flex w-full max-w-md mx-auto flex-wrap items-center justify-center gap-x-2 text-xs sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-2 sm:text-sm">
                <AirportRouteCompact start={start} end={end} airport={airport} />
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <p className="text-sm">
                <RouteStationLink station={start} colorClass="text-green-500" preload={false} />
                <span className="mx-2">→</span>
                <RouteStationLink station={end} colorClass="text-blue-500" preload={false} />
            </p>
        );
    }

    if (variant === "list") {
        return (
            <div className="grid w-full max-w-md mx-auto grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-4 text-xl">
                <RouteStation
                    station={start}
                    containerClassName="min-w-0 flex flex-col items-start"
                    colorClass="text-green-500"
                    className="block max-w-full truncate hover:underline"
                    timeClassName="text-xs text-foreground/60"
                />
                <span className="justify-self-center text-gray-400">→</span>
                <RouteStation
                    station={end}
                    containerClassName="min-w-0 flex flex-col items-end text-right"
                    colorClass="text-blue-500"
                    className="block max-w-full truncate hover:underline"
                    timeClassName="text-xs text-foreground/60"
                />
            </div>
        );
    }

    if (variant === "details") {
        return (
            <div className="text-2xl text-foreground/70 flex items-center justify-center gap-4">
                <RouteStation
                    station={start}
                    containerClassName="flex flex-col items-center"
                    colorClass="text-green-500"
                    timeClassName="text-sm text-foreground/60"
                />
                <span>→</span>
                <RouteStation
                    station={end}
                    containerClassName="flex flex-col items-center"
                    colorClass="text-blue-500"
                    timeClassName="text-sm text-foreground/60"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-4 text-xl">
            <RouteStation
                station={start}
                containerClassName="flex flex-col items-center"
                colorClass="text-green-500"
                className="shrink-0 hover:underline"
                timeClassName="text-xs text-foreground/60"
            />
            <span className="text-gray-400 shrink-0">→</span>
            <RouteStation
                station={end}
                containerClassName="flex flex-col items-center"
                colorClass="text-blue-500"
                className="shrink-0 hover:underline"
                timeClassName="text-xs text-foreground/60"
            />
        </div>
    );
};

export default RouteDisplay;

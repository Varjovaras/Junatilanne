import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { CircleLayerSpecification } from "maplibre-gl";
import { useMemo } from "react";
import { Layer, Popup, Source } from "react-map-gl/maplibre";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { stationSchedulesQueryOptions } from "@/lib/queries/queryOptions";
import type { StationMetadata } from "@/lib/types/stationTypes";
import { formatTime } from "@/lib/utils/dateUtils";
import { stationMetadataToGeoJson } from "@/lib/utils/stationMetadata";
import { getTrainId } from "@/lib/utils/trainDisplay";
import type { MapPopupSelection } from "./mapTypes";

type StationsOnMapProps = {
    stations: StationMetadata[];
    popup: MapPopupSelection;
    setPopup: (popup: MapPopupSelection) => void;
};

export const STATION_POINT_LAYER_IDS = [
    "station-points-major",
    "station-points-commuter",
    "station-points-minor",
] as const;

const tierLayer = (
    id: string,
    minzoom: number,
    radius: number,
    color: string,
    strokeColor: string,
    strokeWidth: number,
): CircleLayerSpecification => ({
    id,
    type: "circle",
    source: "stations",
    minzoom,
    filter: ["==", ["get", "tier"], id.replace("station-points-", "")],
    paint: {
        "circle-color": color,
        "circle-radius": radius,
        "circle-stroke-color": strokeColor,
        "circle-stroke-width": strokeWidth,
    },
});

const stationPointLayers = [
    tierLayer("station-points-major", 7, 6, "#ffffff", "#374151", 2),
    tierLayer("station-points-commuter", 10, 4, "#ffffff", "#374151", 1.5),
    tierLayer("station-points-minor", 12, 4.5, "#d1d5db", "#6b7280", 1.25),
];

const StationsOnMap = ({ stations, popup, setPopup }: StationsOnMapProps) => {
    const { translations } = useTranslations();
    const stationCode = popup?.type === "station" ? popup.id : undefined;
    const stationData = useMemo(() => stationMetadataToGeoJson(stations), [stations]);
    const stationsByCode = useMemo(
        () => new Map(stations.map((station) => [station.stationShortCode, station])),
        [stations],
    );
    const station = stationCode ? stationsByCode.get(stationCode) : undefined;
    const {
        data: stationSchedules,
        isError,
        isPending,
    } = useQuery({
        ...stationSchedulesQueryOptions(stationCode ?? ""),
        enabled: Boolean(stationCode),
    });
    const upcomingSchedules = stationSchedules?.schedules.slice(0, 3) ?? [];

    return (
        <>
            {stations.length > 0 && (
                <Source id="stations" type="geojson" data={stationData} cluster={false}>
                    {stationPointLayers.map((layer) => (
                        <Layer key={layer.id} {...layer} />
                    ))}
                </Source>
            )}
            {station && stationCode && (
                <Popup
                    longitude={station.longitude}
                    latitude={station.latitude}
                    anchor="bottom"
                    onClose={() => setPopup(null)}
                    closeButton={true}
                    closeOnClick={true}
                >
                    <Link
                        to="/stations/$id"
                        params={{ id: stationCode }}
                        className="font-bold text-foreground transition-colors hover:text-red-500"
                    >
                        {station.stationName}
                    </Link>
                    <div className="mt-2 space-y-1 text-sm text-foreground/70">
                        {isPending && <p>{translations.mapLoading}</p>}
                        {isError && <p>{translations.mapStationDataError}</p>}
                        {!isPending && !isError && upcomingSchedules.length === 0 && (
                            <p>{translations.noUpcomingDepartures}</p>
                        )}
                        {!isPending && !isError && upcomingSchedules.length > 0 && (
                            <>
                                <p className="font-medium text-foreground">
                                    {translations.upcomingDepartures}
                                </p>
                                <ul className="space-y-1">
                                    {upcomingSchedules.map((schedule) => {
                                        const stationRow = schedule.timeTableRows.find(
                                            (row) =>
                                                row.stationShortCode === stationCode &&
                                                row.trainStopping,
                                        );
                                        if (!stationRow) return null;

                                        const time = formatTime(stationRow.scheduledTime);

                                        return (
                                            <li key={getTrainId(schedule)}>
                                                <Link
                                                    to="/trains/$id"
                                                    params={{
                                                        id: getTrainId(schedule),
                                                    }}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    {time} · {schedule.trainNumber}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>
                </Popup>
            )}
        </>
    );
};

export default StationsOnMap;

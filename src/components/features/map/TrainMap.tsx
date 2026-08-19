import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
    GeolocateControl,
    type MapEvent,
    type MapLayerMouseEvent,
    type MapRef,
    NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "./TrainMap.css";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { mapTrainsQueryOptions, stationMetadataQueryOptions } from "@/lib/queries/queryOptions";
import type { TrainCategory } from "@/lib/types/trainTypes";
import { getTrainCategory } from "@/lib/utils/trainClassification";
import { ensureTrainSprites } from "@/lib/utils/trainIconSprite";
import RailwaysOnMap from "./RailwaysOnMap";
import StationsOnMap, { STATION_POINT_LAYER_IDS } from "./StationsOnMap";
import TrainSelector from "./TrainSelector";
import TrainsOnMap, { TRAIN_POINT_LAYER_ID } from "./TrainsOnMap";
import type { MapPopupSelection } from "./mapTypes";

type TrainMapProps = {
    trainNumber?: string;
};

const DARK_STYLE = "/map-style.json";
const INITIAL_VIEW_STATE = { longitude: 25.7, latitude: 65.9, zoom: 5 };

const TrainMap = ({ trainNumber }: TrainMapProps) => {
    const { translations } = useTranslations();
    const mapRef = useRef<MapRef>(null);
    const [category, setCategory] = useState<TrainCategory>({
        name: "longDistance",
    });
    const [popup, setPopup] = useState<MapPopupSelection>(null);
    const [spritesReady, setSpritesReady] = useState(false);
    const lastCenteredTrain = useRef<string | undefined>(undefined);

    const { data: trains = [], isFetching, isPending } = useQuery(mapTrainsQueryOptions());
    const { data: stations = [] } = useQuery(stationMetadataQueryOptions());

    useEffect(() => {
        if (!popup) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setPopup(null);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [popup]);

    const centerOnTrain = () => {
        if (
            !trainNumber ||
            trainNumber === lastCenteredTrain.current ||
            !mapRef.current ||
            trains.length === 0
        ) {
            return;
        }

        const targetTrain = trains.find((train) => train.trainNumber.toString() === trainNumber);
        if (targetTrain?.trainLocations[0]?.location) {
            const [lng, lat] = targetTrain.trainLocations[0].location;
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 10,
                duration: 1500,
            });
            lastCenteredTrain.current = trainNumber;
        }
    };

    useEffect(() => {
        centerOnTrain();
        // React Compiler memoizes centerOnTrain, so it is stable between renders
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [centerOnTrain]);

    const filteredTrains = useMemo(() => {
        return trains.filter((train) => {
            switch (category.name) {
                case "commuter":
                    return getTrainCategory(train) === "commuter";
                case "longDistance":
                    return getTrainCategory(train) === "longDistance";
                case "freight":
                    return getTrainCategory(train) === "freight";
                default:
                    return true;
            }
        });
    }, [trains, category]);

    const handleMapClick = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) {
            setPopup(null);
            return;
        }

        if (feature.layer.id === TRAIN_POINT_LAYER_ID) {
            const trainId = feature.properties?.trainId;
            setPopup(typeof trainId === "string" ? { type: "train", id: trainId } : null);
            return;
        }

        if (
            STATION_POINT_LAYER_IDS.includes(
                feature.layer.id as (typeof STATION_POINT_LAYER_IDS)[number],
            )
        ) {
            const code = feature.properties?.code;
            setPopup(typeof code === "string" ? { type: "station", id: code } : null);
            return;
        }

        setPopup(null);
    };

    const handleMapLoad = (event: MapEvent) => {
        void ensureTrainSprites(event.target)
            .then(() => {
                setSpritesReady(true);
                centerOnTrain();
            })
            .catch((error: unknown) => {
                console.error("Failed to load train sprites", error);
            });
    };

    if (isPending && trains.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-foreground/20 border-t-foreground" />
                    <span className="text-sm text-foreground/60">{translations.mapLoading}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <MapGL
                ref={mapRef}
                initialViewState={INITIAL_VIEW_STATE}
                mapStyle={DARK_STYLE}
                onLoad={handleMapLoad}
                interactiveLayerIds={[...STATION_POINT_LAYER_IDS, TRAIN_POINT_LAYER_ID]}
                onClick={handleMapClick}
                onMouseMove={(event) => {
                    const isOverTrain =
                        event.features?.some(
                            (feature) => feature.layer.id === TRAIN_POINT_LAYER_ID,
                        ) ?? false;
                    const canvas = mapRef.current?.getCanvas();
                    if (canvas) canvas.style.cursor = isOverTrain ? "pointer" : "";
                }}
                attributionControl={false}
                style={{ width: "100%", height: "100%" }}
            >
                <NavigationControl position="bottom-right" showCompass={false} />
                <GeolocateControl position="bottom-right" trackUserLocation={true} />
                <RailwaysOnMap />
                <StationsOnMap stations={stations} popup={popup} setPopup={setPopup} />
                <TrainsOnMap
                    filteredTrains={filteredTrains}
                    popup={popup}
                    setPopup={setPopup}
                    spritesReady={spritesReady}
                />
            </MapGL>
            <TrainSelector category={category} setCategory={setCategory} />
            {isFetching && trains.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-foreground/10">
                        <div className="animate-spin h-4 w-4 border-2 border-foreground/20 border-t-foreground rounded-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainMap;

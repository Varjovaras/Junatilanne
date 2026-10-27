import { Popup, Source, Layer } from "react-map-gl/maplibre";
import { useMemo, useRef } from "react";
import type { FeatureCollection, Feature, Point } from "geojson";
import type {
    CircleLayerSpecification,
    FilterSpecification,
    SymbolLayerSpecification,
} from "maplibre-gl";
import type { MapTrain } from "@/lib/types/trainTypes";
import { updateTrainHeadingCache } from "@/lib/utils/trainDirection";
import { getTrainBallColors } from "@/lib/utils/trainDelay";
import { getTrainCategory } from "@/lib/utils/trainClassification";
import { getTrainDisplayName, getTrainId } from "@/lib/utils/trainDisplay";
import {
    TRAIN_ICON_ARROW_SPRITE,
    TRAIN_ICON_GLOW_SPRITE,
    TRAIN_ICON_SPRITE,
} from "@/lib/utils/trainIconSprite";
import type { MapPopupSelection } from "./mapTypes";
import TrainPopupContent from "./TrainPopupContent";

export const TRAIN_POINT_LAYER_ID = "train-points";
const TRAIN_CLUSTER_LAYER_ID = "train-clusters";
const TRAIN_CLUSTER_COUNT_LAYER_ID = "train-cluster-count";
export const TRAIN_CLUSTER_LAYER_IDS = [
    TRAIN_CLUSTER_LAYER_ID,
    TRAIN_CLUSTER_COUNT_LAYER_ID,
] as const;
const TRAIN_GLOW_LAYER_ID = "train-points-glow";
const TRAIN_ARROW_LAYER_ID = "train-points-arrow";

const ICON_SIZE = 1.25;

// Trains closer together than this merge into one ball showing how many are in
// the area; above CLUSTER_MAX_ZOOM every train is drawn on its own.
const CLUSTER_RADIUS = 45;
const CLUSTER_MAX_ZOOM = 8;

const CLUSTER_COLOR = "#334155";
const CLUSTER_STROKE_COLOR = "#ffffff";

// Hides cluster points from the individual-train layers.
const NOT_A_CLUSTER_FILTER: FilterSpecification = ["!", ["has", "point_count"]];

const trainGlowLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_GLOW_LAYER_ID,
    type: "symbol",
    source: "trains",
    filter: NOT_A_CLUSTER_FILTER,
    layout: {
        "icon-image": TRAIN_ICON_GLOW_SPRITE,
        "icon-size": ICON_SIZE,
        "icon-allow-overlap": true,
    },
    paint: {
        "icon-color": ["get", "ballColor"],
        "icon-opacity": 0.25,
    },
});

const trainLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_POINT_LAYER_ID,
    type: "symbol",
    source: "trains",
    filter: NOT_A_CLUSTER_FILTER,
    layout: {
        "icon-image": TRAIN_ICON_SPRITE,
        "icon-size": ICON_SIZE,
        "icon-rotate": ["get", "heading"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "text-field": ["get", "label"],
        "text-size": 10,
        "text-font": ["Noto Sans Bold"],
        "text-anchor": "center",
        "text-max-width": 4.5,
        "text-line-height": 0.95,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-optional": true,
    },
    paint: {
        "icon-color": ["get", "ballColor"],
        "icon-halo-color": "#ffffff",
        "icon-halo-width": 2,
        "text-color": ["get", "textColor"],
    },
});

const trainArrowLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_ARROW_LAYER_ID,
    type: "symbol",
    source: "trains",
    filter: ["all", NOT_A_CLUSTER_FILTER, ["==", ["get", "hasHeading"], true]],
    layout: {
        "icon-image": TRAIN_ICON_ARROW_SPRITE,
        "icon-size": ICON_SIZE,
        "icon-rotate": ["get", "heading"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
    },
    paint: {
        "icon-color": ["get", "ballColor"],
    },
});

const clusterCircleLayer = (): CircleLayerSpecification => ({
    id: TRAIN_CLUSTER_LAYER_ID,
    type: "circle",
    source: "trains",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": CLUSTER_COLOR,
        "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 25, 200, 31],
        "circle-stroke-color": CLUSTER_STROKE_COLOR,
        "circle-stroke-width": 2,
    },
});

const clusterCountLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_CLUSTER_COUNT_LAYER_ID,
    type: "symbol",
    source: "trains",
    filter: ["has", "point_count"],
    layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Bold"],
        "text-size": ["step", ["get", "point_count"], 12, 10, 13, 50, 15, 200, 17],
        "text-allow-overlap": true,
    },
    paint: {
        "text-color": "#ffffff",
    },
});

type TrainFeature = Feature<Point> & {
    properties: {
        trainId: string;
        label: string;
        ballColor: string;
        textColor: string;
        heading: number;
        hasHeading: boolean;
    };
};

type TrainsOnMapProps = {
    filteredTrains: MapTrain[];
    popup: MapPopupSelection;
    setPopup: (popup: MapPopupSelection) => void;
    spritesReady: boolean;
};

const TrainsOnMap = ({ filteredTrains, popup, setPopup, spritesReady }: TrainsOnMapProps) => {
    const headingCache = useRef(new Map<string, number>()).current;

    const geoJson = useMemo<FeatureCollection<Point>>(() => {
        const features: TrainFeature[] = [];

        for (const train of filteredTrains) {
            const location = train.trainLocations[0]?.location;
            if (!location) continue;

            const trainId = getTrainId(train);
            const heading = updateTrainHeadingCache(headingCache, trainId, train.trainLocations);
            const { ball, text } = getTrainBallColors(train.delay, getTrainCategory(train));

            features.push({
                type: "Feature",
                properties: {
                    trainId,
                    label: getTrainDisplayName(train),
                    ballColor: ball,
                    textColor: text,
                    heading: heading ?? 0,
                    hasHeading: heading !== undefined,
                },
                geometry: { type: "Point", coordinates: location },
            });
        }

        return { type: "FeatureCollection", features };
    }, [filteredTrains, headingCache]);

    const selectedTrain =
        popup?.type === "train"
            ? filteredTrains.find((train) => getTrainId(train) === popup.id)
            : undefined;
    const popupLocation = selectedTrain?.trainLocations[0]?.location;

    if (!spritesReady) return null;

    return (
        <>
            <Source
                id="trains"
                type="geojson"
                data={geoJson}
                cluster={true}
                clusterRadius={CLUSTER_RADIUS}
                clusterMaxZoom={CLUSTER_MAX_ZOOM}
            >
                <Layer {...trainGlowLayer()} />
                <Layer {...trainLayer()} />
                <Layer {...trainArrowLayer()} />
                <Layer {...clusterCircleLayer()} />
                <Layer {...clusterCountLayer()} />
            </Source>
            {selectedTrain && popupLocation && (
                <Popup
                    longitude={popupLocation[0]}
                    latitude={popupLocation[1]}
                    anchor="bottom"
                    onClose={() => setPopup(null)}
                    closeButton={true}
                    closeOnClick={true}
                    className="train-popup"
                >
                    <TrainPopupContent train={selectedTrain} />
                </Popup>
            )}
        </>
    );
};

export default TrainsOnMap;

import { Popup, Source, Layer } from "react-map-gl/maplibre";
import { useMemo, useRef } from "react";
import type { FeatureCollection, Feature, Point } from "geojson";
import type { SymbolLayerSpecification } from "maplibre-gl";
import type { MapTrain } from "@/lib/types/trainTypes";
import { updateTrainHeadingCache } from "@/lib/utils/trainDirection";
import { getTrainDelayColor } from "@/lib/utils/trainDelay";
import { getTrainId } from "@/lib/utils/trainDisplay";
import {
    TRAIN_ICON_ARROW_SPRITE,
    TRAIN_ICON_GLOW_SPRITE,
    TRAIN_ICON_SPRITE,
} from "@/lib/utils/trainIconSprite";
import type { MapPopupSelection } from "./mapTypes";
import TrainPopupContent from "./TrainPopupContent";

export const TRAIN_POINT_LAYER_ID = "train-points";
const TRAIN_GLOW_LAYER_ID = "train-points-glow";
const TRAIN_ARROW_LAYER_ID = "train-points-arrow";

const ICON_SIZE = 1;

const trainGlowLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_GLOW_LAYER_ID,
    type: "symbol",
    source: "trains",
    layout: {
        "icon-image": TRAIN_ICON_GLOW_SPRITE,
        "icon-size": ICON_SIZE,
        "icon-allow-overlap": true,
    },
    paint: {
        "icon-color": ["get", "delayColor"],
        "icon-opacity": 0.25,
    },
});

const trainLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_POINT_LAYER_ID,
    type: "symbol",
    source: "trains",
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
        "text-allow-overlap": false,
        "text-optional": true,
    },
    paint: {
        "icon-color": ["get", "delayColor"],
        "icon-halo-color": "#ffffff",
        "icon-halo-width": 2,
        "text-color": "#ffffff",
    },
});

const trainArrowLayer = (): SymbolLayerSpecification => ({
    id: TRAIN_ARROW_LAYER_ID,
    type: "symbol",
    source: "trains",
    filter: ["==", ["get", "hasHeading"], true],
    layout: {
        "icon-image": TRAIN_ICON_ARROW_SPRITE,
        "icon-size": ICON_SIZE,
        "icon-rotate": ["get", "heading"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
    },
    paint: {
        "icon-color": "#ffffff",
    },
});

type TrainFeature = Feature<Point> & {
    properties: {
        trainId: string;
        label: string;
        delayColor: string;
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

            features.push({
                type: "Feature",
                properties: {
                    trainId,
                    label: train.commuterLineid || train.trainNumber.toString(),
                    delayColor: getTrainDelayColor(train.delay),
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
            <Source id="trains" type="geojson" data={geoJson}>
                <Layer {...trainGlowLayer()} />
                <Layer {...trainLayer()} />
                <Layer {...trainArrowLayer()} />
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

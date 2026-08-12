import { Layer, Source } from "react-map-gl/maplibre";
import { RAILWAY_GEOJSON_URL } from "@/lib/utils/railwayData";

const railwayCasingLayer = {
    id: "finland-railways-casing",
    type: "line" as const,
    minzoom: 4,
    layout: {
        "line-cap": "round" as const,
        "line-join": "round" as const,
    },
    paint: {
        "line-color": "#111827",
        "line-width": 4,
        "line-opacity": 0.9,
    },
};

const railwayLineLayer = {
    id: "finland-railways-line",
    type: "line" as const,
    minzoom: 4,
    layout: {
        "line-cap": "round" as const,
        "line-join": "round" as const,
    },
    paint: {
        "line-color": "#f59e0b",
        "line-width": 2,
        "line-opacity": 1,
    },
};

const RailwaysOnMap = () => {
    return (
        <Source id="finland-railways" type="geojson" data={RAILWAY_GEOJSON_URL}>
            <Layer {...railwayCasingLayer} />
            <Layer {...railwayLineLayer} />
        </Source>
    );
};

export default RailwaysOnMap;

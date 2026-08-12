import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { brotliCompressSync } from "node:zlib";

const OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
];
const OUTPUT_PATH = resolve("public/finland-railways.geojson");

// The full OSM geometry is used as-is (no line simplification), so every
// vertex of every railway way is kept — curves stay as rounded as the source
// data allows.
// Six decimals keeps ~0.1 m precision; sub-meter rounding only collapses OSM
// duplicate nodes at shared junctions, which helps the client graph connect.
const COORDINATE_DECIMALS = 6;

type OverpassWay = {
    type: "way";
    id: number;
    tags?: Record<string, string>;
    geometry?: Array<{ lat: number; lon: number }>;
};

type OverpassResponse = {
    elements: OverpassWay[];
};

type Coordinate = [number, number];

function roundToDecimals(coordinates: Coordinate[]): Coordinate[] {
    const factor = 10 ** COORDINATE_DECIMALS;
    return coordinates.map(([lon, lat]) => [
        Math.round(lon * factor) / factor,
        Math.round(lat * factor) / factor,
    ]);
}

// Bounding box around Haparanda (Sweden) so the Tornio–Haaparanta line is drawn
// across the border to the Haparanda station approach. Overpass `way(bbox)`
// returns the full geometry of intersecting ways and the union dedupes the
// Finnish ways already matched by the area query.
const HAPARANDA_BBOX = "65.80,24.02,65.88,24.22";

const query = `
[out:json][timeout:120];
area["ISO3166-1"="FI"]["boundary"="administrative"]->.finland;
(
  way(area.finland)
    ["railway"="rail"]
    ["service"!~"^(siding|spur|yard|crossover|maintenance)$"]
    ["usage"!~"^(disused|abandoned)$"]
    ["disused"!~"^(yes|true)$"]
    ["abandoned"!~"^(yes|true)$"]
    ["construction"!~"^(yes|true)$"]
    ["proposed"!~"^(yes|true)$"];
  way(${HAPARANDA_BBOX})
    ["railway"="rail"]
    ["service"!~"^(siding|spur|yard|crossover|maintenance)$"]
    ["usage"!~"^(disused|abandoned)$"]
    ["disused"!~"^(yes|true)$"]
    ["abandoned"!~"^(yes|true)$"]
    ["construction"!~"^(yes|true)$"]
    ["proposed"!~"^(yes|true)$"];
);
out geom qt;
`;

let payload: OverpassResponse | undefined;
const errors: string[] = [];

for (const url of OVERPASS_URLS) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "juna-finland-railway-data/1.0",
            },
            body: new URLSearchParams({ data: query }),
        });

        if (response.ok) {
            payload = (await response.json()) as OverpassResponse;
            break;
        }

        errors.push(`${url}: ${response.status} ${response.statusText}`);
    } catch (error) {
        errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

if (!payload) {
    throw new Error(`All Overpass requests failed:\n${errors.join("\n")}`);
}

const lines = payload.elements
    .filter((way) => way.type === "way" && (way.geometry?.length ?? 0) >= 2)
    .map((way) => roundToDecimals(way.geometry!.map(({ lon, lat }) => [lon, lat])))
    .filter((line) => line.length >= 2);

const geoJson = {
    type: "FeatureCollection" as const,
    features: [
        {
            type: "Feature" as const,
            geometry: {
                type: "MultiLineString" as const,
                coordinates: lines,
            },
        },
    ],
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(geoJson)}\n`, "utf8");

const data = await readFile(OUTPUT_PATH);
const gzipData = Bun.gzipSync(data);
const brotliData = brotliCompressSync(data);
await writeFile(`${OUTPUT_PATH}.gz`, gzipData);
await writeFile(`${OUTPUT_PATH}.br`, brotliData);

console.log(
    `Wrote ${lines.length} railway lines to ${OUTPUT_PATH} ` +
        `(raw: ${(data.byteLength / 1024).toFixed(0)} kB, ` +
        `gzip: ${(gzipData.byteLength / 1024).toFixed(0)} kB, ` +
        `brotli: ${(brotliData.byteLength / 1024).toFixed(0)} kB)`,
);

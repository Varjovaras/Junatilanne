import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { brotliCompressSync } from "node:zlib";

const OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
];
const OUTPUT_PATH = resolve("public/finland-railways.geojson");

// Simplification tolerance in degrees (~220 m at this latitude). The railways
// are drawn as thin overlay lines between zoom 4-10, so sub-100 m detail is
// invisible. Rounding to 4 decimals keeps ~11 m precision.
const SIMPLIFY_TOLERANCE = 0.002;
const COORDINATE_DECIMALS = 4;

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

function simplifyLine(coordinates: Coordinate[], tolerance: number): Coordinate[] {
    if (coordinates.length <= 2) return coordinates;

    const sqTolerance = tolerance * tolerance;
    const simplified: Coordinate[] = [];
    const stack: Array<[number, number]> = [[0, coordinates.length - 1]];
    const keep = new Uint8Array(coordinates.length);

    while (stack.length > 0) {
        const [first, last] = stack.pop()!;
        const [x1, y1] = coordinates[first];
        const [x2, y2] = coordinates[last];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lineSq = dx * dx + dy * dy;

        let maxDistSq = -1;
        let index = -1;

        for (let i = first + 1; i < last; i++) {
            const [px, py] = coordinates[i];
            let distSq;
            if (lineSq === 0) {
                distSq = (px - x1) * (px - x1) + (py - y1) * (py - y1);
            } else {
                const t = ((px - x1) * dx + (py - y1) * dy) / lineSq;
                const tClamped = t < 0 ? 0 : t > 1 ? 1 : t;
                const qx = x1 + tClamped * dx;
                const qy = y1 + tClamped * dy;
                distSq = (px - qx) * (px - qx) + (py - qy) * (py - qy);
            }
            if (distSq > maxDistSq) {
                maxDistSq = distSq;
                index = i;
            }
        }

        if (maxDistSq > sqTolerance && index !== -1) {
            keep[index] = 1;
            stack.push([first, index], [index, last]);
        }
    }

    for (let i = 0; i < coordinates.length; i++) {
        if (i === 0 || i === coordinates.length - 1 || keep[i]) {
            simplified.push(coordinates[i]);
        }
    }
    return simplified;
}

function simplifyCoordinates(coordinates: Coordinate[]): Coordinate[] {
    const factor = 10 ** COORDINATE_DECIMALS;
    return simplifyLine(coordinates, SIMPLIFY_TOLERANCE).map(([lon, lat]) => [
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
    .map((way) => simplifyCoordinates(way.geometry!.map(({ lon, lat }) => [lon, lat])))
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

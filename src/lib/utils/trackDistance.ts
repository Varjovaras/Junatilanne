import type { TimeTableRow, TrainLocation, TrainType } from "../types/trainTypes";
import { RAILWAY_GEOJSON_URL } from "./railwayData";
import { distanceBetweenCoordinates } from "./trainDirection";
import {
    getCommercialArrivalStations,
    getCommercialStations,
    getLastVisitedRowIndex,
    getNextCommercialStation,
} from "./trainStations";

// Node identity is quantized to ~1 m. OSM ways that meet at a junction share
// the exact same node coordinate, so quantizing lets separate ways connect into
// one navigable network while parallel tracks stay distinct.
const NODE_KEY_DECIMALS = 5;
const METERS_PER_DEGREE = 111_320;
// Above this distance from the nearest mapped track a fix is treated as
// unreliable (GPS glitch, station lay-by, OSM gap) and we fall back.
const MAX_SNAP_DISTANCE_METERS = 2_500;
// OSM ways often do not share exact junction nodes (station throats, parallel
// tracks converging within a few meters), and sub-meter quantization cannot
// bridge those gaps, which would disconnect the network. Connecting every way
// endpoint to nearby endpoints of other ways restores connectivity while
// endpoint-only gluing keeps parallel tracks distinct.
const WAY_ENDPOINT_GLUE_METERS = 40;
// Cell size of the spatial index used to snap fixes and stations to the
// network without scanning every edge in the country (~100-170 m per cell).
const SNAP_INDEX_CELL_SIZE = 0.0015;
// Longest lon-wise cell extent in Finland (cos(70°) is the smallest latitude
// the network reaches); used as a safe lower bound when stopping the snap
// search early.
const SNAP_INDEX_MIN_CELL_METERS = SNAP_INDEX_CELL_SIZE * METERS_PER_DEGREE * 0.34;
// Yield to the main thread every N lines while building the graph so the
// one-time build never blocks for more than a few tens of milliseconds.
const GRAPH_BUILD_YIELD_LINES = 400;

// Yields to the main thread so a long computation stays below the long-task
// threshold (~50 ms) and the page remains responsive.
const yieldToMainThread = (): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, 0);
    });

export type Coordinate = [number, number];

type Graph = {
    nodes: Coordinate[];
    adj: Map<number, Array<[number, number]>>;
    snapIndex: Map<string, Array<[number, number]>>;
};

type Snap = {
    nodeFrom: number;
    nodeTo: number;
    offsetFromNode: number;
    edgeLength: number;
};

export type TrackDistances = {
    toNextStationKm: number;
    toDestinationKm: number;
    nextStationShortCode: string;
    destinationShortCode: string;
    method: "track" | "straightLine";
};

let linesPromise: Promise<Coordinate[][]> | undefined;
let graphCache: { lines: Coordinate[][]; graph: Promise<Graph> } | undefined;

class MinHeap {
    private items: Array<[number, number]> = [];

    get size(): number {
        return this.items.length;
    }

    push(item: [number, number]): void {
        const items = this.items;
        items.push(item);
        let index = items.length - 1;
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (items[parent][0] <= items[index][0]) break;
            [items[parent], items[index]] = [items[index], items[parent]];
            index = parent;
        }
    }

    pop(): [number, number] | undefined {
        const items = this.items;
        if (items.length === 0) return undefined;

        const top = items[0];
        const last = items.pop()!;
        if (items.length > 0) {
            items[0] = last;
            let index = 0;
            for (;;) {
                const left = 2 * index + 1;
                const right = 2 * index + 2;
                let smallest = index;

                if (left < items.length && items[left][0] < items[smallest][0]) {
                    smallest = left;
                }
                if (right < items.length && items[right][0] < items[smallest][0]) {
                    smallest = right;
                }
                if (smallest === index) break;

                [items[index], items[smallest]] = [items[smallest], items[index]];
                index = smallest;
            }
        }
        return top;
    }
}

const nodeKey = ([longitude, latitude]: Coordinate): string =>
    `${longitude.toFixed(NODE_KEY_DECIMALS)},${latitude.toFixed(NODE_KEY_DECIMALS)}`;

// Connect every way endpoint to nearby endpoints of other ways. A cell grid
// keeps the neighbor lookup linear in the number of endpoints. The bounding
// box uses cos(70°) so it covers the glue radius at any Finnish latitude.
const glueWayEndpoints = async (
    nodes: Coordinate[],
    adj: Map<number, Array<[number, number]>>,
    wayEndpoints: number[],
): Promise<void> => {
    const unique = [...new Set(wayEndpoints)];
    if (unique.length < 2) return;

    const radiusDegrees = WAY_ENDPOINT_GLUE_METERS / (METERS_PER_DEGREE * 0.34);
    const cellSize = radiusDegrees * 2.5;
    const cellKey = (coordinate: Coordinate): string =>
        `${Math.floor(coordinate[0] / cellSize)},${Math.floor(coordinate[1] / cellSize)}`;
    const cellIndex = new Map<string, number[]>();
    for (const nodeId of unique) {
        const key = cellKey(nodes[nodeId]);
        const bucket = cellIndex.get(key);
        if (bucket === undefined) {
            cellIndex.set(key, [nodeId]);
        } else {
            bucket.push(nodeId);
        }
    }

    let processed = 0;
    for (const nodeId of unique) {
        processed += 1;
        if (processed % GRAPH_BUILD_YIELD_LINES === 0) {
            await yieldToMainThread();
        }

        const coordinate = nodes[nodeId];
        const cellLon = Math.floor(coordinate[0] / cellSize);
        const cellLat = Math.floor(coordinate[1] / cellSize);
        const neighbors = adj.get(nodeId)!;
        for (let dLon = -1; dLon <= 1; dLon++) {
            for (let dLat = -1; dLat <= 1; dLat++) {
                for (const candidate of cellIndex.get(`${cellLon + dLon},${cellLat + dLat}`) ??
                    []) {
                    if (candidate === nodeId) continue;
                    const candidateCoordinate = nodes[candidate];
                    if (Math.abs(candidateCoordinate[0] - coordinate[0]) > radiusDegrees) continue;
                    if (Math.abs(candidateCoordinate[1] - coordinate[1]) > radiusDegrees) continue;
                    if (neighbors.some(([neighbor]) => neighbor === candidate)) continue;
                    const distance = distanceBetweenCoordinates(coordinate, candidateCoordinate);
                    if (distance > WAY_ENDPOINT_GLUE_METERS) continue;
                    neighbors.push([candidate, distance]);
                    adj.get(candidate)!.push([nodeId, distance]);
                }
            }
        }
    }
};

// Register an edge in every cell it passes through, so a point in any of those
// cells can find the edge by looking up its own neighborhood.
const indexEdge = (
    snapIndex: Map<string, Array<[number, number]>>,
    nodes: Coordinate[],
    from: number,
    to: number,
): void => {
    const [fromLon, fromLat] = nodes[from];
    const [toLon, toLat] = nodes[to];
    const meters = Math.hypot(
        (toLon - fromLon) * Math.cos((fromLat * Math.PI) / 180),
        toLat - fromLat,
    );
    const steps = Math.max(1, Math.ceil(meters / (SNAP_INDEX_CELL_SIZE / 3)));
    let lastKey: string | undefined;
    for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const key = `${Math.floor((fromLon + (toLon - fromLon) * t) / SNAP_INDEX_CELL_SIZE)},${Math.floor(
            (fromLat + (toLat - fromLat) * t) / SNAP_INDEX_CELL_SIZE,
        )}`;
        if (key === lastKey) continue;
        lastKey = key;
        const bucket = snapIndex.get(key);
        if (bucket === undefined) {
            snapIndex.set(key, [[from, to]]);
        } else {
            bucket.push([from, to]);
        }
    }
};

const buildGraph = async (lines: Coordinate[][]): Promise<Graph> => {
    const nodes: Coordinate[] = [];
    const adj = new Map<number, Array<[number, number]>>();
    const snapIndex = new Map<string, Array<[number, number]>>();
    const nodeIdsByKey = new Map<string, number>();
    const wayEndpoints: number[] = [];

    const getId = (coordinate: Coordinate): number => {
        const key = nodeKey(coordinate);
        const existing = nodeIdsByKey.get(key);
        if (existing !== undefined) return existing;

        const id = nodes.length;
        nodeIdsByKey.set(key, id);
        nodes.push(coordinate);
        adj.set(id, []);
        return id;
    };

    let processedLines = 0;
    for (const line of lines) {
        if (line.length < 2) continue;

        let previous = getId(line[0]);
        wayEndpoints.push(previous);
        for (let index = 1; index < line.length; index++) {
            const next = getId(line[index]);
            if (previous !== next) {
                const distance = distanceBetweenCoordinates(nodes[previous], nodes[next]);
                adj.get(previous)!.push([next, distance]);
                adj.get(next)!.push([previous, distance]);
            }
            previous = next;
        }
        wayEndpoints.push(previous);

        processedLines += 1;
        if (processedLines % GRAPH_BUILD_YIELD_LINES === 0) {
            await yieldToMainThread();
        }
    }

    let processedEdges = 0;
    for (const [nodeId, neighbors] of adj) {
        for (const [neighborId] of neighbors) {
            if (neighborId > nodeId) {
                indexEdge(snapIndex, nodes, nodeId, neighborId);
                processedEdges += 1;
                if (processedEdges % 20_000 === 0) {
                    await yieldToMainThread();
                }
            }
        }
    }

    await glueWayEndpoints(nodes, adj, wayEndpoints);

    return { nodes, adj, snapIndex };
};

const getGraphForLines = (lines: Coordinate[][]): Promise<Graph> => {
    if (graphCache === undefined || graphCache.lines !== lines) {
        graphCache = { lines, graph: buildGraph(lines) };
    }
    return graphCache.graph;
};

const loadRailwayLines = async (): Promise<Coordinate[][]> => {
    if (linesPromise) return linesPromise;

    linesPromise = (async () => {
        const response = await fetch(RAILWAY_GEOJSON_URL);
        if (!response.ok) {
            throw new Error(`Railway data not available. HTTP error! status: ${response.status}`);
        }

        const geojson = (await response.json()) as {
            features: Array<{ geometry: { coordinates: Coordinate[][] } }>;
        };

        return geojson.features[0]?.geometry.coordinates ?? [];
    })();

    return linesPromise;
};

const toLocalMeters = (point: Coordinate, reference: Coordinate): [number, number] => {
    const cosLatitude = Math.cos((reference[1] * Math.PI) / 180);
    return [
        (point[0] - reference[0]) * METERS_PER_DEGREE * cosLatitude,
        (point[1] - reference[1]) * METERS_PER_DEGREE,
    ];
};

// Project a point onto a line segment in local planar meters and return the
// perpendicular distance plus the normalized parameter t in [0, 1].
const projectOnSegment = (
    point: Coordinate,
    from: Coordinate,
    to: Coordinate,
): { distance: number; t: number } => {
    const pointLocal = toLocalMeters(point, from);
    const toLocal = toLocalMeters(to, from);
    const segmentLengthSq = toLocal[0] * toLocal[0] + toLocal[1] * toLocal[1];

    let t = 0;
    if (segmentLengthSq > 0) {
        t = (pointLocal[0] * toLocal[0] + pointLocal[1] * toLocal[1]) / segmentLengthSq;
        t = Math.min(1, Math.max(0, t));
    }

    const projectionX = toLocal[0] * t;
    const projectionY = toLocal[1] * t;
    const distance = Math.hypot(pointLocal[0] - projectionX, pointLocal[1] - projectionY);

    return { distance, t };
};

// Snap a point onto the nearest track edge, searching outward through the
// spatial index instead of scanning the whole network. The search stops once
// the best found distance is smaller than the closest any unscanned edge could
// be, which keeps the common case (a fix on or near the track) to a handful of
// cells.
const snapToNetwork = (graph: Graph, point: Coordinate): Snap | undefined => {
    const centerLon = Math.floor(point[0] / SNAP_INDEX_CELL_SIZE);
    const centerLat = Math.floor(point[1] / SNAP_INDEX_CELL_SIZE);
    const maxRing = Math.ceil(MAX_SNAP_DISTANCE_METERS / SNAP_INDEX_MIN_CELL_METERS) + 2;

    let bestDistance = Number.POSITIVE_INFINITY;
    let best: Snap | undefined;

    for (let ring = 0; ring <= maxRing; ring++) {
        for (let dLon = -ring; dLon <= ring; dLon++) {
            for (let dLat = -ring; dLat <= ring; dLat++) {
                if (Math.max(Math.abs(dLon), Math.abs(dLat)) !== ring) continue;
                const bucket = graph.snapIndex.get(`${centerLon + dLon},${centerLat + dLat}`);
                if (bucket === undefined) continue;
                for (const [fromId, toId] of bucket) {
                    const from = graph.nodes[fromId];
                    const to = graph.nodes[toId];
                    const { distance, t } = projectOnSegment(point, from, to);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        const edgeLength = distanceBetweenCoordinates(from, to);
                        best = {
                            nodeFrom: fromId,
                            nodeTo: toId,
                            offsetFromNode: t * edgeLength,
                            edgeLength,
                        };
                    }
                }
            }
        }

        // Cells at Chebyshev distance k are at least (k - 1) cells away from
        // the point in the lon direction at the highest Finnish latitudes, so
        // nothing unscanned can beat the best found distance once it is below
        // that bound.
        if (bestDistance <= Math.max(0, ring - 1) * SNAP_INDEX_MIN_CELL_METERS) break;
    }

    if (best === undefined || bestDistance > MAX_SNAP_DISTANCE_METERS) return undefined;

    return best;
};

type DijkstraResult = { length: number; nodes: number[] } | null;

const dijkstra = (
    adj: Map<number, Array<[number, number]>>,
    start: number,
    target: number,
): DijkstraResult => {
    if (start === target) return { length: 0, nodes: [start] };

    const distances = new Map<number, number>([[start, 0]]);
    const previous = new Map<number, number>();
    const heap = new MinHeap();
    heap.push([0, start]);

    while (heap.size > 0) {
        const [cost, node] = heap.pop()!;
        if (node === target) {
            const nodes: number[] = [];
            let current: number | undefined = target;
            while (current !== undefined) {
                nodes.push(current);
                current = previous.get(current);
            }
            return { length: cost, nodes: nodes.reverse() };
        }
        if (cost > (distances.get(node) ?? Number.POSITIVE_INFINITY)) continue;

        for (const [neighbor, weight] of adj.get(node) ?? []) {
            const nextCost = cost + weight;
            if (nextCost < (distances.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
                distances.set(neighbor, nextCost);
                previous.set(neighbor, node);
                heap.push([nextCost, neighbor]);
            }
        }
    }

    return null;
};

// The snapped positions become virtual nodes so the shortest path can leave and
// rejoin an edge on either side, which also handles train and target sharing
// the same segment. Used when the whole route is a single segment.
const shortestPathBetweenSnaps = (graph: Graph, train: Snap, target: Snap): number | null => {
    const adj = new Map<number, Array<[number, number]>>();
    for (const [nodeId, neighbors] of graph.adj) {
        adj.set(nodeId, [...neighbors]);
    }

    const trainNode = graph.nodes.length;
    const targetNode = graph.nodes.length + 1;
    adj.set(trainNode, [
        [train.nodeFrom, train.offsetFromNode],
        [train.nodeTo, train.edgeLength - train.offsetFromNode],
    ]);
    adj.set(targetNode, []);

    for (const [nodeId, offset] of [
        [target.nodeFrom, target.offsetFromNode],
        [target.nodeTo, target.edgeLength - target.offsetFromNode],
    ] as const) {
        adj.get(nodeId)!.push([targetNode, offset]);
    }

    return dijkstra(adj, trainNode, targetNode)?.length ?? null;
};

const shortestPathNodes = (graph: Graph, start: number, target: number): number[] | null => {
    return dijkstra(graph.adj, start, target)?.nodes ?? null;
};

// The station's own position on the network: the projection point of its
// coordinates on the snapped edge, interpolated back into coordinate space.
const snappedStationVertex = (graph: Graph, snap: Snap): Coordinate => {
    const from = graph.nodes[snap.nodeFrom];
    const to = graph.nodes[snap.nodeTo];
    const t = snap.edgeLength > 0 ? snap.offsetFromNode / snap.edgeLength : 0;
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
};

// The anchor node the route uses to enter/leave the station's snapped edge.
// Picking one deterministically keeps the polyline continuous at the junction
// between two consecutive segments.
const canonicalAnchor = (snap: Snap): number =>
    snap.offsetFromNode <= snap.edgeLength / 2 ? snap.nodeFrom : snap.nodeTo;

// Shortest path along the network between two consecutive stations, including
// the stations' own snapped vertices at both ends. Cached per ordered station
// pair: the same segment recurs across trains (every commuter train on the same
// line) and the network is static per GeoJSON version.
let segmentCache: { lines: Coordinate[][]; paths: Map<string, Coordinate[]> } | undefined;

const getSegmentPath = (
    graph: Graph,
    lines: Coordinate[][],
    from: TimeTableRow,
    to: TimeTableRow,
): Coordinate[] | null => {
    const key = `${from.station.shortCode}|${to.station.shortCode}`;
    if (segmentCache !== undefined && segmentCache.lines === lines) {
        const cached = segmentCache.paths.get(key);
        if (cached !== undefined) return cached;
    }

    const fromSnap = snapToNetwork(graph, from.station.location);
    const toSnap = snapToNetwork(graph, to.station.location);
    if (fromSnap === undefined || toSnap === undefined) return null;

    const nodes = shortestPathNodes(graph, canonicalAnchor(fromSnap), canonicalAnchor(toSnap));
    if (nodes === null) return null;

    const path = [
        snappedStationVertex(graph, fromSnap),
        ...nodes.map((nodeId) => graph.nodes[nodeId]),
        snappedStationVertex(graph, toSnap),
    ];

    if (segmentCache === undefined || segmentCache.lines !== lines) {
        segmentCache = { lines, paths: new Map() };
    }
    segmentCache.paths.set(key, path);
    return path;
};

// Project a point onto the polyline starting at `fromVertex`. Returns the
// perpendicular distance and the along-route progress in meters.
const projectFixOnPolyline = (
    polyline: Coordinate[],
    vertexCumulative: number[],
    point: Coordinate,
    fromVertex: number,
): { distance: number; progress: number } | null => {
    if (fromVertex >= polyline.length - 1) return null;

    let bestDistance = Number.POSITIVE_INFINITY;
    let bestProgress = 0;
    for (let vertex = fromVertex; vertex < polyline.length - 1; vertex++) {
        const { distance, t } = projectOnSegment(point, polyline[vertex], polyline[vertex + 1]);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestProgress =
                vertexCumulative[vertex] +
                t * (vertexCumulative[vertex + 1] - vertexCumulative[vertex]);
        }
    }

    return bestDistance === Number.POSITIVE_INFINITY
        ? null
        : { distance: bestDistance, progress: bestProgress };
};

const straightLineFallback = (
    latestLocation: TrainLocation,
    nextStation: TimeTableRow,
    destination: TimeTableRow,
): TrackDistances => ({
    toNextStationKm:
        distanceBetweenCoordinates(latestLocation.location, nextStation.station.location) / 1000,
    toDestinationKm:
        distanceBetweenCoordinates(latestLocation.location, destination.station.location) / 1000,
    nextStationShortCode: nextStation.station.shortCode,
    destinationShortCode: destination.station.shortCode,
    method: "straightLine",
});

// Core distance calculation over an explicit railway network. When `lines` is
// undefined (network unavailable) or the train cannot be joined to the track,
// it falls back to a straight-line estimate.
//
// Distances are measured along the train's scheduled route: the ordered
// commercial stops define the route, and each consecutive pair is connected by
// the shortest path along the network (between adjacent stops this is the real
// track). The live position is projected onto that route and all distances are
// measured forward from there, so the train can never be routed backwards or
// around shortcuts.
export const getTrackDistancesForLines = async (
    train: TrainType,
    lines: Coordinate[][] | undefined,
): Promise<TrackDistances | null> => {
    const latestLocation = train.trainLocations[0];
    if (!latestLocation) return null;

    // The ordered, non-cancelled commercial arrivals are the route.
    const routeStations = getCommercialArrivalStations(train);
    if (routeStations.length === 0) return null;

    const nextStationRow = getNextCommercialStation(train);
    const destinationRow = routeStations[routeStations.length - 1];
    if (!nextStationRow || !destinationRow) return null;

    if (!lines) {
        return straightLineFallback(latestLocation, nextStationRow, destinationRow);
    }

    const graph = await getGraphForLines(lines);

    // The route starts at the origin station, so fixes between the origin and
    // the first stop can be measured too.
    const originRow = getCommercialStations(train.timeTableRows, "DEPARTURE")[0];
    const stations = originRow !== undefined ? [originRow, ...routeStations] : routeStations;

    // No route segments at all; measure straight over the network from the fix
    // to the station instead.
    if (stations.length === 1) {
        const trainSnap = snapToNetwork(graph, latestLocation.location);
        const stationSnap = snapToNetwork(graph, destinationRow.station.location);
        if (trainSnap && stationSnap) {
            const meters = shortestPathBetweenSnaps(graph, trainSnap, stationSnap);
            if (meters !== null) {
                return {
                    toNextStationKm: meters / 1000,
                    toDestinationKm: meters / 1000,
                    nextStationShortCode: destinationRow.station.shortCode,
                    destinationShortCode: destinationRow.station.shortCode,
                    method: "track",
                };
            }
        }
        return straightLineFallback(latestLocation, nextStationRow, destinationRow);
    }

    // Assemble the route polyline from the per-segment network paths. Each
    // station contributes its own snapped vertex, so progress along the
    // polyline matches the station-to-station distances.
    const polyline: Coordinate[] = [];
    const vertexCumulative: number[] = [];
    const segmentVertexStart: number[] = [];
    const stationPos: number[] = [0];
    let cumulative = 0;

    for (let segment = 0; segment < stations.length - 1; segment++) {
        const path = getSegmentPath(graph, lines, stations[segment], stations[segment + 1]);
        if (path === null) {
            return straightLineFallback(latestLocation, nextStationRow, destinationRow);
        }

        segmentVertexStart.push(polyline.length);

        for (const vertex of path) {
            const previous = polyline[polyline.length - 1];
            if (previous !== undefined && vertex[0] === previous[0] && vertex[1] === previous[1]) {
                continue;
            }
            if (previous !== undefined) {
                cumulative += distanceBetweenCoordinates(previous, vertex);
            }
            polyline.push(vertex);
            vertexCumulative.push(cumulative);
        }

        stationPos.push(cumulative);
    }

    // The timetable's visited rows narrow down where on the route the train can
    // be, which keeps doubled-back / loop routes unambiguous. The fix may be
    // ahead of the timetable, so candidates start at the segment after the last
    // visited station and extend to the end of the route.
    const lastVisitedRowIndex = getLastVisitedRowIndex(train.timeTableRows);
    let visitedCount = 0;
    for (const row of routeStations) {
        if (train.timeTableRows.indexOf(row) > lastVisitedRowIndex) break;
        visitedCount += 1;
    }
    // The origin counts as visited as soon as it exists; each visited arrival
    // adds one more segment.
    const visitedStationCount = (originRow !== undefined ? 1 : 0) + visitedCount;

    // The first candidate segment shares its junction vertex with the previous
    // segment, so the projection starts one vertex before its recorded start.
    const firstCandidateSegment = Math.min(
        Math.max(visitedStationCount - 1, 0),
        segmentVertexStart.length - 1,
    );
    const projectionStartVertex = Math.max(0, segmentVertexStart[firstCandidateSegment] - 1);
    let projection = projectFixOnPolyline(
        polyline,
        vertexCumulative,
        latestLocation.location,
        projectionStartVertex,
    );
    if (projection === null || projection.distance > MAX_SNAP_DISTANCE_METERS) {
        projection = projectFixOnPolyline(polyline, vertexCumulative, latestLocation.location, 0);
    }
    if (projection === null || projection.distance > MAX_SNAP_DISTANCE_METERS) {
        return straightLineFallback(latestLocation, nextStationRow, destinationRow);
    }

    const routeProgress = projection.progress;

    // The next station is the first one the train has not reached yet.
    let nextIndex = stations.findIndex((_, index) => stationPos[index] > routeProgress + 1);
    let resolvedNextStation: TimeTableRow;
    let toNextStationKm: number;
    if (nextIndex !== -1) {
        resolvedNextStation = stations[nextIndex];
        toNextStationKm = Math.max(0, stationPos[nextIndex] - routeProgress) / 1000;
    } else {
        // The fix is at or past the last station: the train has arrived at the
        // destination (the timetable may lag behind).
        resolvedNextStation = destinationRow;
        toNextStationKm = 0;
    }

    const toDestinationKm = Math.max(0, stationPos[stationPos.length - 1] - routeProgress) / 1000;

    return {
        toNextStationKm,
        toDestinationKm,
        nextStationShortCode: resolvedNextStation.station.shortCode,
        destinationShortCode: destinationRow.station.shortCode,
        method: "track",
    };
};

export const getTrackDistances = async (train: TrainType): Promise<TrackDistances | null> => {
    let lines: Coordinate[][] | undefined;

    try {
        lines = await loadRailwayLines();
    } catch {
        lines = undefined;
    }

    return getTrackDistancesForLines(train, lines);
};

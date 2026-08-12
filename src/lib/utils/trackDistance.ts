import type { TrainLocation, TrainType } from "../types/trainTypes";
import { RAILWAY_GEOJSON_URL } from "./railwayData";
import { distanceBetweenCoordinates } from "./trainDirection";
import { getCommercialStations, getNextCommercialStation } from "./trainStations";

// Node identity is quantized to ~1 m. OSM ways that meet at a junction share
// the exact same node coordinate, so quantizing lets separate ways connect into
// one navigable network while parallel tracks stay distinct.
const NODE_KEY_DECIMALS = 5;
const METERS_PER_DEGREE = 111_320;
// Above this distance from the nearest mapped track a fix is treated as
// unreliable (GPS glitch, station lay-by, OSM gap) and we fall back.
const MAX_SNAP_DISTANCE_METERS = 2_500;

export type Coordinate = [number, number];

type Graph = {
    nodes: Coordinate[];
    adj: Map<number, Array<[number, number]>>;
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
    method: "track" | "straightLine";
};

let linesPromise: Promise<Coordinate[][]> | undefined;
let graphCache: { lines: Coordinate[][]; graph: Graph } | undefined;

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

const buildGraph = (lines: Coordinate[][]): Graph => {
    const nodes: Coordinate[] = [];
    const adj = new Map<number, Array<[number, number]>>();
    const nodeIdsByKey = new Map<string, number>();

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

    for (const line of lines) {
        if (line.length < 2) continue;

        let previous = getId(line[0]);
        for (let index = 1; index < line.length; index++) {
            const next = getId(line[index]);
            if (previous !== next) {
                const distance = distanceBetweenCoordinates(nodes[previous], nodes[next]);
                adj.get(previous)!.push([next, distance]);
                adj.get(next)!.push([previous, distance]);
            }
            previous = next;
        }
    }

    return { nodes, adj };
};

const getGraphForLines = (lines: Coordinate[][]): Graph => {
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

const snapToNetwork = (graph: Graph, point: Coordinate): Snap | undefined => {
    let bestDistance = Number.POSITIVE_INFINITY;
    let best: Snap | undefined;

    for (const [nodeId, neighbors] of graph.adj) {
        const from = graph.nodes[nodeId];
        for (const [neighborId] of neighbors) {
            const to = graph.nodes[neighborId];
            const { distance, t } = projectOnSegment(point, from, to);
            if (distance < bestDistance) {
                bestDistance = distance;
                const edgeLength = distanceBetweenCoordinates(from, to);
                best = {
                    nodeFrom: nodeId,
                    nodeTo: neighborId,
                    offsetFromNode: t * edgeLength,
                    edgeLength,
                };
            }
        }
    }

    if (best === undefined || bestDistance > MAX_SNAP_DISTANCE_METERS) return undefined;

    return best;
};

const dijkstra = (
    adj: Map<number, Array<[number, number]>>,
    start: number,
    target: number,
): number | null => {
    if (start === target) return 0;

    const distances = new Map<number, number>([[start, 0]]);
    const heap = new MinHeap();
    heap.push([0, start]);

    while (heap.size > 0) {
        const [cost, node] = heap.pop()!;
        if (node === target) return cost;
        if (cost > (distances.get(node) ?? Number.POSITIVE_INFINITY)) continue;

        for (const [neighbor, weight] of adj.get(node) ?? []) {
            const nextCost = cost + weight;
            if (nextCost < (distances.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
                distances.set(neighbor, nextCost);
                heap.push([nextCost, neighbor]);
            }
        }
    }

    return null;
};

// The snapped positions become virtual nodes so the shortest path can leave and
// rejoin an edge on either side, which also handles train and target sharing
// the same segment.
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

    return dijkstra(adj, trainNode, targetNode);
};

const straightLineFallback = (
    latestLocation: TrainLocation,
    nextStation: Coordinate,
    destination: Coordinate,
): TrackDistances => ({
    toNextStationKm: distanceBetweenCoordinates(latestLocation.location, nextStation) / 1000,
    toDestinationKm: distanceBetweenCoordinates(latestLocation.location, destination) / 1000,
    method: "straightLine",
});

// Core distance calculation over an explicit railway network. When `lines` is
// undefined (network unavailable) or the train cannot be joined to the track,
// it falls back to a straight-line estimate.
export const getTrackDistancesForLines = (
    train: TrainType,
    lines: Coordinate[][] | undefined,
): TrackDistances | null => {
    const latestLocation = train.trainLocations[0];
    if (!latestLocation) return null;

    const nextStation = getNextCommercialStation(train);
    const commercialArrivals = getCommercialStations(train.timeTableRows, "ARRIVAL");
    const destination = commercialArrivals[commercialArrivals.length - 1];
    if (!nextStation || !destination) return null;

    const nextStationLocation = nextStation.station.location;
    const destinationLocation = destination.station.location;

    if (!lines) {
        return straightLineFallback(latestLocation, nextStationLocation, destinationLocation);
    }

    const graph = getGraphForLines(lines);
    const trainSnap = snapToNetwork(graph, latestLocation.location);
    const nextStationSnap = snapToNetwork(graph, nextStationLocation);
    const destinationSnap = snapToNetwork(graph, destinationLocation);

    if (!trainSnap || !nextStationSnap || !destinationSnap) {
        return straightLineFallback(latestLocation, nextStationLocation, destinationLocation);
    }

    const toNextStation = shortestPathBetweenSnaps(graph, trainSnap, nextStationSnap);
    const toDestination = shortestPathBetweenSnaps(graph, trainSnap, destinationSnap);

    if (toNextStation === null || toDestination === null) {
        return straightLineFallback(latestLocation, nextStationLocation, destinationLocation);
    }

    return {
        toNextStationKm: toNextStation / 1000,
        toDestinationKm: toDestination / 1000,
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

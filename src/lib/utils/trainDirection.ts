import type { TrainLocation } from "../types/trainTypes";

const EARTH_RADIUS_METERS = 6_371_000;
const MIN_HEADING_DISTANCE_METERS = 20;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export const distanceBetweenCoordinates = (
    first: [number, number],
    second: [number, number],
): number => {
    const firstLatitude = toRadians(first[1]);
    const secondLatitude = toRadians(second[1]);
    const latitudeDelta = secondLatitude - firstLatitude;
    const longitudeDelta = toRadians(second[0] - first[0]);
    const haversine =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

    return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const calculateBearing = (previous: TrainLocation, latest: TrainLocation): number | undefined => {
    const previousTimestamp = Date.parse(previous.timestamp);
    const latestTimestamp = Date.parse(latest.timestamp);

    if (
        !Number.isFinite(previousTimestamp) ||
        !Number.isFinite(latestTimestamp) ||
        latestTimestamp <= previousTimestamp
    ) {
        return undefined;
    }

    const distance = distanceBetweenCoordinates(previous.location, latest.location);
    if (!Number.isFinite(distance) || distance < MIN_HEADING_DISTANCE_METERS) {
        return undefined;
    }

    const previousLatitude = toRadians(previous.location[1]);
    const latestLatitude = toRadians(latest.location[1]);
    const longitudeDelta = toRadians(latest.location[0] - previous.location[0]);
    const bearing = toDegrees(
        Math.atan2(
            Math.sin(longitudeDelta) * Math.cos(latestLatitude),
            Math.cos(previousLatitude) * Math.sin(latestLatitude) -
                Math.sin(previousLatitude) * Math.cos(latestLatitude) * Math.cos(longitudeDelta),
        ),
    );

    return (bearing + 360) % 360;
};

const getLatestTrainHeading = (locations: TrainLocation[]): number | undefined => {
    const latest = locations[0];
    const previous = locations[1];

    return latest && previous ? calculateBearing(previous, latest) : undefined;
};

export const updateTrainHeadingCache = (
    cache: Map<string, number>,
    trainId: string,
    locations: TrainLocation[],
): number | undefined => {
    const latestHeading = getLatestTrainHeading(locations);
    if (latestHeading !== undefined) {
        cache.set(trainId, latestHeading);
    }

    return latestHeading ?? cache.get(trainId);
};

// The railway network file is a static asset in /public that gets the same URL
// across deployments. Browsers cache it aggressively, so a version is appended
// as a cache-buster; bump this constant whenever the data is regenerated.
export const RAILWAY_DATA_VERSION = "2026-08-12-full";

export const RAILWAY_GEOJSON_URL = `/finland-railways.geojson?v=${RAILWAY_DATA_VERSION}`;

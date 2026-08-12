import type { Map } from "maplibre-gl";

export const TRAIN_ICON_SPRITE = "train-icon";
export const TRAIN_ICON_GLOW_SPRITE = "train-icon-glow";
export const TRAIN_ICON_ARROW_SPRITE = "train-icon-arrow";

const VIEWBOX_SIZE = 36;
const SPRITE_SCALE = 2;
const SPRITE_SIZE = VIEWBOX_SIZE * SPRITE_SCALE;

const toSvg = (body: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SPRITE_SIZE}" height="${SPRITE_SIZE}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}">${body}</svg>`;

const circle = (radius: number): string =>
    `<circle cx="18" cy="18" r="${radius}" fill="#ffffff" />`;

const arrow = `<path d="M18 6 L22 14 L18 12 L14 14 Z" fill="#ffffff" />`;

const TRAIN_SPRITES: Record<string, string> = {
    [TRAIN_ICON_SPRITE]: toSvg(circle(14)),
    [TRAIN_ICON_GLOW_SPRITE]: toSvg(circle(16)),
    [TRAIN_ICON_ARROW_SPRITE]: toSvg(arrow),
};

const loadSvgImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load train icon sprite"));
        image.src = url;
    });

export const ensureTrainSprites = async (map: Map): Promise<void> => {
    const missing = Object.entries(TRAIN_SPRITES).filter(([name]) => !map.hasImage(name));
    if (missing.length === 0) return;

    await Promise.all(
        missing.map(async ([name, body]) => {
            const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(body)}`;
            const image = await loadSvgImage(svgDataUrl);
            map.addImage(name, image, { sdf: true, pixelRatio: SPRITE_SCALE });
        }),
    );
};

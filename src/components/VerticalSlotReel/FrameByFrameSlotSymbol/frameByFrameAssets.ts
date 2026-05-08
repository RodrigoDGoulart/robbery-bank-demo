import { Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";
import type { FrameByFrameSlotSymbolConfig } from ".";

type FrameByFrameAssets = {
  spritesheet: Spritesheet;
  spritesheetData: SpritesheetData;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const spritesheetCache = new Map<string, Promise<FrameByFrameAssets>>();

function loadImageElement(src: string) {
  const cachedImage = imageCache.get(src);

  if (cachedImage) {
    return cachedImage;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image ${src}`));
    image.src = src;
  });

  imageCache.set(src, imagePromise);

  return imagePromise;
}

export function getSortedFrameNames(frames: SpritesheetData["frames"]) {
  return Object.keys(frames).sort((leftFrameName, rightFrameName) => {
    const leftIndex = Number(leftFrameName.split("_").at(-1));
    const rightIndex = Number(rightFrameName.split("_").at(-1));

    return leftIndex - rightIndex;
  });
}

export function loadFrameByFrameAssets(symbol: FrameByFrameSlotSymbolConfig) {
  const cachedSpritesheet = spritesheetCache.get(symbol.id);

  if (cachedSpritesheet) {
    return cachedSpritesheet;
  }

  const spritesheetPromise = Promise.all([
    fetch(symbol.jsonPath),
    loadImageElement(symbol.imagePath),
  ]).then(async ([spritesheetResponse, image]) => {
    const spritesheetData =
      (await spritesheetResponse.json()) as SpritesheetData;
    const texture = Texture.from(image);
    const spritesheet = new Spritesheet(texture, spritesheetData);

    await spritesheet.parse();

    return {
      spritesheet,
      spritesheetData,
    };
  });

  spritesheetCache.set(symbol.id, spritesheetPromise);

  return spritesheetPromise;
}

import { Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";
import type { FrameByFrameSlotSymbolConfig } from ".";

type FrameByFrameAssets = {
  frames: Texture[];
  frameNames: string[];
  spritesheet: Spritesheet;
  spritesheetData: SpritesheetData;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const spritesheetCache = new Map<string, Promise<FrameByFrameAssets>>();
const previewSrcCache = new Map<string, string>();

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

function createFramePreviewSrc(
  image: HTMLImageElement,
  frameData: SpritesheetData["frames"][string],
) {
  const sourceWidth = frameData.sourceSize?.w ?? frameData.frame.w;
  const sourceHeight = frameData.sourceSize?.h ?? frameData.frame.h;
  const sourceX = frameData.spriteSourceSize?.x ?? 0;
  const sourceY = frameData.spriteSourceSize?.y ?? 0;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  if (!context) {
    return "";
  }

  context.drawImage(
    image,
    frameData.frame.x,
    frameData.frame.y,
    frameData.frame.w,
    frameData.frame.h,
    sourceX,
    sourceY,
    frameData.frame.w,
    frameData.frame.h,
  );

  return canvas.toDataURL("image/png");
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

    const frameNames = getSortedFrameNames(spritesheetData.frames);
    const frames = frameNames.map((frameName) => spritesheet.textures[frameName]);

    return {
      frames,
      frameNames,
      spritesheet,
      spritesheetData,
    };
  });

  spritesheetCache.set(symbol.id, spritesheetPromise);

  return spritesheetPromise;
}

export function getLoadedFrameByFramePreviewSrc(
  symbol: FrameByFrameSlotSymbolConfig,
) {
  return previewSrcCache.get(symbol.id);
}

export function loadFrameByFramePreviewSrc(
  symbol: FrameByFrameSlotSymbolConfig,
) {
  const cachedPreviewSrc = previewSrcCache.get(symbol.id);

  if (cachedPreviewSrc) {
    return Promise.resolve(cachedPreviewSrc);
  }

  return Promise.all([
    loadFrameByFrameAssets(symbol),
    loadImageElement(symbol.imagePath),
  ]).then(([{ spritesheetData }, image]) => {
    const firstFrameName = getSortedFrameNames(spritesheetData.frames)[0];
    const firstFrameData = spritesheetData.frames[firstFrameName];

    if (!firstFrameData) {
      return "";
    }

    const previewSrc = createFramePreviewSrc(image, firstFrameData);

    previewSrcCache.set(symbol.id, previewSrc);

    return previewSrc;
  });
}

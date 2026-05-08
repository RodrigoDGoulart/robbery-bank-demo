import { Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";

const FOX_ASSET_PATH = "/SpineFiles/Fox";
const FOX_SPRITESHEET_PATH = `${FOX_ASSET_PATH}/fox.json`;
const FOX_IMAGE_PATH = `${FOX_ASSET_PATH}/fox.png`;
const FOX_WIN_SPRITESHEET_PATH = `${FOX_ASSET_PATH}/fox_win.json`;
const FOX_WIN_IMAGE_PATH = `${FOX_ASSET_PATH}/fox_win.png`;

type FoxFrames = {
  idleFrames: Texture[];
  winFrames: Texture[];
};

let foxFramesPromise: Promise<FoxFrames> | null = null;

function getSortedFoxFrameNames(frames: SpritesheetData["frames"]) {
  return Object.keys(frames).sort((leftFrameName, rightFrameName) => {
    const leftIndex = Number(leftFrameName.split("_").at(-1));
    const rightIndex = Number(rightFrameName.split("_").at(-1));

    return leftIndex - rightIndex;
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image ${src}`));
    image.src = src;
  });
}

async function loadFoxFrames(spritesheetPath: string, imagePath: string) {
  const spritesheetResponse = await fetch(spritesheetPath);
  const image = await loadImageElement(imagePath);
  const spritesheetData = (await spritesheetResponse.json()) as SpritesheetData;
  const texture = Texture.from(image);
  const spritesheet = new Spritesheet(texture, spritesheetData);

  await spritesheet.parse();

  return getSortedFoxFrameNames(spritesheetData.frames).map(
    (frameName) => spritesheet.textures[frameName],
  );
}

export function preloadFoxAnimations() {
  if (foxFramesPromise) {
    return foxFramesPromise;
  }

  foxFramesPromise = (async () => {
    const idleFrames = await loadFoxFrames(FOX_SPRITESHEET_PATH, FOX_IMAGE_PATH);
    const winFrames = await loadFoxFrames(
      FOX_WIN_SPRITESHEET_PATH,
      FOX_WIN_IMAGE_PATH,
    );

    return {
      idleFrames,
      winFrames,
    };
  })().catch((error: unknown) => {
    foxFramesPromise = null;
    throw error;
  });

  return foxFramesPromise;
}

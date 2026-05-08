import { Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData, Texture as PixiTexture } from "pixi.js";
import type { WinPopUpAnimation } from "./WinPopUp.constants";

type LoadedWinPopUpAssets = {
  frames: PixiTexture[];
  sourceWidth: number;
  sourceHeight: number;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const animationCache = new Map<string, Promise<LoadedWinPopUpAssets>>();

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

function getFrameIndex(frameName: string) {
  const match = frameName.match(/_(\d+)$/);

  return match ? Number(match[1]) : 0;
}

function getSortedFrameNames(frames: SpritesheetData["frames"]) {
  return Object.keys(frames).sort(
    (leftFrameName, rightFrameName) =>
      getFrameIndex(leftFrameName) - getFrameIndex(rightFrameName),
  );
}

function getMaxSourceSize(spritesheetDataList: SpritesheetData[]) {
  return spritesheetDataList.reduce(
    (maxSize, spritesheetData) => {
      for (const frame of Object.values(spritesheetData.frames)) {
        maxSize.width = Math.max(
          maxSize.width,
          frame.sourceSize?.w ?? frame.frame.w,
        );
        maxSize.height = Math.max(
          maxSize.height,
          frame.sourceSize?.h ?? frame.frame.h,
        );
      }

      return maxSize;
    },
    { width: 1, height: 1 },
  );
}

export function loadWinPopUpFrameAssets(animation: WinPopUpAnimation) {
  const cachedAnimation = animationCache.get(animation.id);

  if (cachedAnimation) {
    return cachedAnimation;
  }

  const animationPromise = Promise.all(
    animation.sheets.map(async (sheet) => {
      const [spritesheetResponse, image] = await Promise.all([
        fetch(sheet.jsonPath),
        loadImageElement(sheet.imagePath),
      ]);
      const spritesheetData =
        (await spritesheetResponse.json()) as SpritesheetData;
      const texture = Texture.from(image);
      const spritesheet = new Spritesheet(texture, spritesheetData);

      await spritesheet.parse();

      return {
        spritesheet,
        spritesheetData,
      };
    }),
  ).then((loadedSheets) => {
    const sourceSize = getMaxSourceSize(
      loadedSheets.map(({ spritesheetData }) => spritesheetData),
    );
    const frames = loadedSheets
      .flatMap(({ spritesheet, spritesheetData }) =>
        getSortedFrameNames(spritesheetData.frames).map((frameName) => ({
          index: getFrameIndex(frameName),
          texture: spritesheet.textures[frameName],
        })),
      )
      .sort((leftFrame, rightFrame) => leftFrame.index - rightFrame.index)
      .map(({ texture }) => texture);

    return {
      frames,
      sourceWidth: sourceSize.width,
      sourceHeight: sourceSize.height,
    };
  });

  animationCache.set(animation.id, animationPromise);

  return animationPromise;
}

import { loadFrameByFrameAssets } from "../FrameByFrameSlotSymbol/frameByFrameAssets";
import { preloadSpineSymbolAssets } from "../SpineSlotSymbol/spineAssets";
import { slotItemConfigs } from "./SlotItem.constants";

let preloadPromise: Promise<void> | null = null;

function preloadStaticImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export function preloadSlotItemAnimations() {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all(
    slotItemConfigs.flatMap((item) => {
      const preloadTasks: Promise<unknown>[] = [
        preloadStaticImage(item.staticImage.src),
      ];

      if (item.animation?.type === "frame-by-frame") {
        preloadTasks.push(loadFrameByFrameAssets(item.animation.symbol));
      }

      if (item.animation?.type === "spine") {
        preloadTasks.push(preloadSpineSymbolAssets(item.animation.symbol));
      }

      return preloadTasks;
    }),
  )
    .then(() => undefined)
    .catch((error: unknown) => {
      preloadPromise = null;
      console.error("Failed to preload slot item animations", error);
    });

  return preloadPromise;
}

import { loadFrameByFrameAssets } from "../FrameByFrameSlotSymbol/frameByFrameAssets";
import { preloadSpineSymbolAssets } from "../SpineSlotSymbol/spineAssets";
import { slotItemConfigs } from "./SlotItem.constants";

let preloadPromise: Promise<void> | null = null;
let loadedSlotItems = 0;
const preloadProgressListeners = new Set<
  (loadedItems: number, totalItems: number) => void
>();

type PreloadSlotItemAnimationsOptions = {
  onItemLoaded?: (loadedItems: number, totalItems: number) => void;
};

export function preloadStaticImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export function preloadSlotItemAnimations(
  options: PreloadSlotItemAnimationsOptions = {},
) {
  if (options.onItemLoaded) {
    options.onItemLoaded(loadedSlotItems, slotItemConfigs.length);
    preloadProgressListeners.add(options.onItemLoaded);
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    for (const [index, item] of slotItemConfigs.entries()) {
      await preloadStaticImage(item.staticImage.src);
      if (item.animation?.type === "frame-by-frame") {
        await loadFrameByFrameAssets(item.animation.symbol);
      }

      if (item.animation?.type === "spine") {
        await preloadSpineSymbolAssets(item.animation.symbol);
      }

      loadedSlotItems = index + 1;
      for (const listener of preloadProgressListeners) {
        listener(loadedSlotItems, slotItemConfigs.length);
      }
    }
  })().catch((error: unknown) => {
    preloadPromise = null;
    loadedSlotItems = 0;
    console.error("Failed to preload slot item animations", error);
  });

  return preloadPromise;
}

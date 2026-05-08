import {
  loadFrameByFrameAssets,
  loadFrameByFramePreviewSrc,
} from "../FrameByFrameSlotSymbol/frameByFrameAssets";
import { preloadSpineSymbolAssets } from "../SpineSlotSymbol/spineAssets";
import { slotItemConfigs } from "./SlotItem.constants";

let preloadPromise: Promise<void> | null = null;

function getSlotItemAnimationPreloadTasks(itemIndex: number): Promise<unknown>[] {
  const item = slotItemConfigs[itemIndex];

  if (!item?.animation) {
    return [];
  }

  if (item.animation.type === "frame-by-frame") {
    return [
      loadFrameByFrameAssets(item.animation.symbol),
      loadFrameByFramePreviewSrc(item.animation.symbol),
    ];
  }

  return [preloadSpineSymbolAssets(item.animation.symbol)];
}

export function preloadSlotItemAnimation(itemIndex: number) {
  return Promise.all(getSlotItemAnimationPreloadTasks(itemIndex)).then(
    () => undefined,
  );
}

export function preloadSlotItemAnimations() {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all(
    slotItemConfigs.flatMap((_, itemIndex) =>
      getSlotItemAnimationPreloadTasks(itemIndex),
    ),
  )
    .then(() => undefined)
    .catch((error: unknown) => {
      preloadPromise = null;
      console.error("Failed to preload slot item animations", error);
      throw error;
    });

  return preloadPromise;
}

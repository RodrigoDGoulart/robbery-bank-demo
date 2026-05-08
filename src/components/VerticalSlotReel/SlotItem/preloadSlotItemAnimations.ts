import {
  loadFrameByFrameAssets,
} from "../FrameByFrameSlotSymbol/frameByFrameAssets";
import { preloadSpineSymbolAssets } from "../SpineSlotSymbol/spineAssets";
import { slotItemConfigs } from "./SlotItem.constants";

let preloadPromise: Promise<void> | null = null;

async function preloadSlotItemAnimationByIndex(itemIndex: number) {
  const item = slotItemConfigs[itemIndex];

  if (!item?.animation) {
    return;
  }

  if (item.animation.type === "frame-by-frame") {
    await loadFrameByFrameAssets(item.animation.symbol);
    return;
  }

  await preloadSpineSymbolAssets(item.animation.symbol);
}

export function preloadSlotItemAnimation(itemIndex: number) {
  return preloadSlotItemAnimationByIndex(itemIndex);
}

export function preloadSlotItemAnimations() {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    for (const itemIndex of slotItemConfigs.keys()) {
      await preloadSlotItemAnimationByIndex(itemIndex);
    }
  })()
    .catch((error: unknown) => {
      preloadPromise = null;
      console.error("Failed to preload slot item animations", error);
      throw error;
    });

  return preloadPromise;
}

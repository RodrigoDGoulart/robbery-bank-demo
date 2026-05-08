import { Assets } from "pixi.js";
import type { SpineSlotSymbol } from "./spineSlotItems.constants";

const SPINE_ASSET_ROOT = "/SpineFiles";

export function getSpineAssetAliases(symbol: SpineSlotSymbol) {
  return {
    skeleton: `slot-symbol-${symbol.id}-skeleton`,
    atlas: `slot-symbol-${symbol.id}-atlas`,
  };
}

export function registerSpineSymbolAssets(symbol: SpineSlotSymbol) {
  const aliases = getSpineAssetAliases(symbol);
  const basePath = `${SPINE_ASSET_ROOT}/${symbol.folder}`;

  if (!Assets.resolver.hasKey(aliases.skeleton)) {
    Assets.add({
      alias: aliases.skeleton,
      src: `${basePath}/${symbol.skeletonFile}`,
    });
  }

  if (!Assets.resolver.hasKey(aliases.atlas)) {
    Assets.add({
      alias: aliases.atlas,
      src: `${basePath}/${symbol.atlasFile}`,
    });
  }

  return aliases;
}

export function preloadSpineSymbolAssets(symbol: SpineSlotSymbol) {
  const aliases = registerSpineSymbolAssets(symbol);

  return Assets.load([aliases.skeleton, aliases.atlas]);
}

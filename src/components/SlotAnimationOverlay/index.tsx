import { Spine } from "@esotericsoftware/spine-pixi-v8";
import {
  AnimatedSprite,
  Application,
  Container,
  Sprite,
  Texture,
} from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import {
  getSortedFrameNames,
  loadFrameByFrameAssets,
} from "../VerticalSlotReel/FrameByFrameSlotSymbol/frameByFrameAssets";
import {
  getSpineAssetAliases,
  preloadSpineSymbolAssets,
} from "../VerticalSlotReel/SpineSlotSymbol/spineAssets";
import type { SpineSlotSymbol } from "../VerticalSlotReel/SpineSlotSymbol/spineSlotItems.constants";
import { preloadStaticImage } from "../VerticalSlotReel/SlotItem/preloadSlotItemAnimations";
import type { SlotItemConfig } from "../VerticalSlotReel/SlotItem/SlotItem.constants";
import "./SlotAnimationOverlay.scss";

export type SlotAnimationOverlayColumn = SlotItemConfig[];
type SlotAnimationOverlayGap = number | "space-between";

type SlotAnimationOverlayProps = {
  columns: SlotAnimationOverlayColumn[];
  className?: string;
  visibleRows?: number;
  width?: number;
  height?: number;
  cellWidth?: number;
  cellHeight?: number;
  columnGap?: SlotAnimationOverlayGap;
  rowGap?: SlotAnimationOverlayGap;
};

const CANVAS_PADDING = 8;
const DEFAULT_FPS = 30;
const SPINE_ANIMATION_FPS = 30;
const SPINE_ANIMATION_STEP = 1 / SPINE_ANIMATION_FPS;

function getSymbolScale(
  bounds: { width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
) {
  const maxWidth = canvasWidth - CANVAS_PADDING * 2;
  const maxHeight = canvasHeight - CANVAS_PADDING * 2;

  return Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
}

function applyVisibleSlotMask(spine: Spine, symbol: SpineSlotSymbol) {
  if (!symbol.visibleSlotPrefixes?.length) {
    return;
  }

  for (const slot of spine.skeleton.slots) {
    const slotName = slot.data.name;
    const shouldKeepSlot = symbol.visibleSlotPrefixes.some((prefix) =>
      slotName.startsWith(prefix),
    );

    if (!shouldKeepSlot) {
      slot.setAttachment(null);
    }
  }
}

function getCellPosition(
  columnIndex: number,
  rowIndex: number,
  cellWidth: number,
  cellHeight: number,
  columnGap: number,
  rowGap: number,
) {
  return {
    x: columnIndex * (cellWidth + columnGap) + cellWidth / 2,
    y: rowIndex * (cellHeight + rowGap) + cellHeight / 2,
  };
}

function getDistributedGap(
  gap: SlotAnimationOverlayGap,
  availableSize: number,
  cellSize: number,
  totalCells: number,
) {
  if (gap !== "space-between" || totalCells <= 1) {
    return typeof gap === "number" ? gap : 0;
  }

  return Math.max((availableSize - totalCells * cellSize) / (totalCells - 1), 0);
}

function getDefaultCanvasSize(
  totalCells: number,
  cellSize: number,
  gap: SlotAnimationOverlayGap,
) {
  const numericGap = typeof gap === "number" ? gap : 0;

  return totalCells * cellSize + Math.max(totalCells - 1, 0) * numericGap;
}

function addStaticSprite(
  stage: Container,
  item: SlotItemConfig,
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
) {
  const texture = Texture.from(item.staticImage.src);
  const sprite = new Sprite(texture);
  const visual = item.staticImage.visual;
  const width = Number(visual.width ?? cellWidth);
  const height = Number(visual.height ?? cellHeight);
  const scale = Math.min(cellWidth / width, cellHeight / height) * (visual.scale ?? 1);

  sprite.anchor.set(0.5);
  sprite.scale.set(scale);
  sprite.position.set(x + (visual.translateX ?? 0), y + (visual.translateY ?? 0));
  stage.addChild(sprite);
}

async function addFrameByFrameSymbol(
  stage: Container,
  item: SlotItemConfig,
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
) {
  if (item.animation?.type !== "frame-by-frame") {
    return;
  }

  const { spritesheet, spritesheetData } = await loadFrameByFrameAssets(
    item.animation.symbol,
  );
  const frameNames = getSortedFrameNames(spritesheetData.frames);
  const frames = frameNames.map((frameName) => spritesheet.textures[frameName]);
  const animatedSymbol = new AnimatedSprite({
    textures: frames,
    animationSpeed: (item.animation.symbol.fps ?? DEFAULT_FPS) / 60,
    autoPlay: true,
    loop: true,
    updateAnchor: true,
  });
  const visual = item.animation.visual;
  const canvasWidth = Number(visual.width ?? cellWidth);
  const canvasHeight = Number(visual.height ?? cellHeight);
  const symbolScale = getSymbolScale(
    {
      width: item.animation.symbol.sourceWidth,
      height: item.animation.symbol.sourceHeight,
    },
    canvasWidth,
    canvasHeight,
  );

  animatedSymbol.anchor.set(0.5);
  animatedSymbol.scale.set(symbolScale * (visual.scale ?? 1));
  animatedSymbol.position.set(
    x + (visual.translateX ?? 0),
    y + (visual.translateY ?? 0),
  );
  stage.addChild(animatedSymbol);
}

async function addSpineSymbol(
  stage: Container,
  spineSymbols: Spine[],
  item: SlotItemConfig,
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
) {
  if (item.animation?.type !== "spine") {
    return;
  }

  const symbol = item.animation.symbol;
  await preloadSpineSymbolAssets(symbol);

  const aliases = getSpineAssetAliases(symbol);
  const spine = Spine.from({
    skeleton: aliases.skeleton,
    atlas: aliases.atlas,
    autoUpdate: false,
  });
  const visual = item.animation.visual;
  const canvasWidth = Number(visual.width ?? cellWidth);
  const canvasHeight = Number(visual.height ?? cellHeight);
  const scale = getSymbolScale(symbol.bounds, canvasWidth, canvasHeight);

  spine.scale.set(scale * (visual.scale ?? 1));
  spine.position.set(
    x +
      (visual.translateX ?? 0) -
      (symbol.bounds.x + symbol.bounds.width / 2) * spine.scale.x,
    y +
      (visual.translateY ?? 0) -
      (symbol.bounds.y + symbol.bounds.height / 2) * spine.scale.y,
  );
  spine.state.setAnimation(0, symbol.animation, true);
  spine.update(0);
  applyVisibleSlotMask(spine, symbol);

  spineSymbols.push(spine);
  stage.addChild(spine);
}

function SlotAnimationOverlay({
  columns,
  className = "",
  visibleRows = 5,
  width,
  height,
  cellWidth = 120,
  cellHeight = 109,
  columnGap = 0,
  rowGap = 0,
}: SlotAnimationOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeVisibleRows = Math.max(1, visibleRows);
  const canvasWidth = useMemo(
    () =>
      width ??
      getDefaultCanvasSize(columns.length, cellWidth, columnGap),
    [cellWidth, columnGap, columns.length, width],
  );
  const canvasHeight = useMemo(
    () =>
      height ??
      getDefaultCanvasSize(safeVisibleRows, cellHeight, rowGap),
    [cellHeight, height, rowGap, safeVisibleRows],
  );
  const distributedColumnGap = useMemo(
    () => getDistributedGap(columnGap, canvasWidth, cellWidth, columns.length),
    [canvasWidth, cellWidth, columnGap, columns.length],
  );
  const distributedRowGap = useMemo(
    () => getDistributedGap(rowGap, canvasHeight, cellHeight, safeVisibleRows),
    [canvasHeight, cellHeight, rowGap, safeVisibleRows],
  );

  useEffect(() => {
    let app: Application | null = null;
    let isCancelled = false;
    let isInitialized = false;
    let isDestroyed = false;
    const spineSymbols: Spine[] = [];

    function destroyPixiApp() {
      if (!app || !isInitialized || isDestroyed) return;

      isDestroyed = true;
      app.destroy({ removeView: true }, { children: true });
      app = null;
      spineSymbols.length = 0;
    }

    async function setupOverlay() {
      const container = containerRef.current;

      if (!container) return;

      const pixiApp = new Application();
      app = pixiApp;

      await pixiApp.init({
        width: canvasWidth,
        height: canvasHeight,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      isInitialized = true;

      if (isCancelled) {
        destroyPixiApp();
        return;
      }

      container.appendChild(pixiApp.canvas);

      for (const [columnIndex, column] of columns.entries()) {
        const visibleItems = column.slice(0, safeVisibleRows);

        for (const [rowIndex, item] of visibleItems.entries()) {
          const { x, y } = getCellPosition(
            columnIndex,
            rowIndex,
            cellWidth,
            cellHeight,
            distributedColumnGap,
            distributedRowGap,
          );

          if (item.animation?.type === "frame-by-frame") {
            await addFrameByFrameSymbol(
              pixiApp.stage,
              item,
              x,
              y,
              cellWidth,
              cellHeight,
            );
          } else if (item.animation?.type === "spine") {
            await addSpineSymbol(
              pixiApp.stage,
              spineSymbols,
              item,
              x,
              y,
              cellWidth,
              cellHeight,
            );
          } else {
            await preloadStaticImage(item.staticImage.src);
            addStaticSprite(pixiApp.stage, item, x, y, cellWidth, cellHeight);
          }

          if (isCancelled || isDestroyed) return;
        }
      }

      pixiApp.ticker.add(() => {
        const deltaSeconds = pixiApp.ticker.deltaMS / 1000;

        for (const spine of spineSymbols) {
          spine.update(Math.min(deltaSeconds, SPINE_ANIMATION_STEP));
        }
      });
    }

    setupOverlay().catch((error: unknown) => {
      console.error("Failed to create slot animation overlay", error);
    });

    return () => {
      isCancelled = true;
      destroyPixiApp();
    };
  }, [
    canvasHeight,
    canvasWidth,
    cellHeight,
    cellWidth,
    columnGap,
    columns,
    distributedColumnGap,
    distributedRowGap,
    rowGap,
    safeVisibleRows,
  ]);

  return (
    <div
      className={["slot-animation-overlay", className].filter(Boolean).join(" ")}
      ref={containerRef}
      style={{ width: canvasWidth, height: canvasHeight }}
      aria-hidden="true"
    />
  );
}

export default SlotAnimationOverlay;

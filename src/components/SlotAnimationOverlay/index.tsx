import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { AnimatedSprite, Application, Assets, Container } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { ReelVisibleSnapshot } from "../VerticalSlotReel";
import { loadFrameByFrameAssets } from "../VerticalSlotReel/FrameByFrameSlotSymbol/frameByFrameAssets";
import {
  getSpineAssetAliases,
  registerSpineSymbolAssets,
} from "../VerticalSlotReel/SpineSlotSymbol/spineAssets";
import type { SpineSlotSymbol } from "../VerticalSlotReel/SpineSlotSymbol/spineSlotItems.constants";
import { slotItemConfigs } from "../VerticalSlotReel/SlotItem/SlotItem.constants";
import type { SlotItemVisualConfig } from "../VerticalSlotReel/SlotItem/SlotItem.constants";
import "./SlotAnimationOverlay.scss";

export type SlotAnimationOverlayMode = "idle" | "spinning" | "win";

type SlotAnimationOverlayProps = {
  mode: SlotAnimationOverlayMode;
  reelSnapshots: Record<number, ReelVisibleSnapshot>;
  winningItemIndex: number | null;
  onReady?: () => void;
};

const CANVAS_PADDING = 8;
const DEFAULT_FPS = 30;

function getNumericVisualSize(
  value: SlotItemVisualConfig["width"] | SlotItemVisualConfig["height"],
  fallback: number,
) {
  return typeof value === "number" ? value : fallback;
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

function clearStage(stage: Container) {
  for (const child of stage.removeChildren()) {
    child.destroy({ children: true });
  }
}

function destroyPixiApp(app: Application | null) {
  if (!app?.renderer) {
    return;
  }

  app.destroy({ removeView: true }, { children: true });
}

function SlotAnimationOverlay({
  mode,
  reelSnapshots,
  winningItemIndex,
  onReady,
}: SlotAnimationOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const onReadyRef = useRef(onReady);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let isCancelled = false;
    let isInitialized = false;
    let app: Application | null = null;

    async function setupApp() {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const pixiApp = new Application();
      const rect = container.getBoundingClientRect();

      app = pixiApp;
      await pixiApp.init({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      isInitialized = true;

      if (isCancelled) {
        destroyPixiApp(pixiApp);
        return;
      }

      pixiApp.canvas.className = "slot-animation-overlay__canvas";
      container.appendChild(pixiApp.canvas);
      appRef.current = pixiApp;
      setAppReady(true);
    }

    void setupApp();

    return () => {
      isCancelled = true;
      appRef.current = null;
      setAppReady(false);
      if (isInitialized) {
        destroyPixiApp(app);
      }
    };
  }, []);

  useEffect(() => {
    if (!appReady) {
      return;
    }

    const app = appRef.current;
    const container = containerRef.current;

    if (!app || !container) {
      return;
    }

    let cancelled = false;

    async function renderOverlay() {
      const app = appRef.current;
      const container = containerRef.current;

      if (!app || !container) {
        return;
      }

      clearStage(app.stage);

      if (mode === "spinning") {
        onReadyRef.current?.();
        return;
      }

      const overlayRect = container.getBoundingClientRect();
      app.renderer.resize(
        Math.max(1, Math.round(overlayRect.width)),
        Math.max(1, Math.round(overlayRect.height)),
      );

      const cells = Object.values(reelSnapshots)
        .flatMap((snapshot) => snapshot.cells)
        .filter((cell) => {
          if (mode === "idle") {
            return true;
          }

          return cell.isCenter && cell.itemIndex === winningItemIndex;
        });

      for (const cell of cells) {
        const item = slotItemConfigs[cell.itemIndex];
        const animation = item?.animation;

        if (!animation) {
          continue;
        }

        const visual = animation.visual;
        const targetWidth = getNumericVisualSize(visual.width, cell.rect.width);
        const targetHeight = getNumericVisualSize(visual.height, cell.rect.height);
        const centerX =
          cell.rect.left - overlayRect.left + cell.rect.width / 2 + (visual.translateX ?? 0);
        const centerY =
          cell.rect.top - overlayRect.top + cell.rect.height / 2 + (visual.translateY ?? 0);

        if (animation.type === "frame-by-frame") {
          const { frames } = await loadFrameByFrameAssets(animation.symbol);

          if (cancelled) {
            return;
          }

          const sprite = new AnimatedSprite({
            textures: frames,
            animationSpeed: (animation.symbol.fps ?? DEFAULT_FPS) / 60,
            autoPlay: true,
            loop: true,
            updateAnchor: true,
          });
          const scale =
            Math.min(
              (targetWidth - CANVAS_PADDING * 2) / animation.symbol.sourceWidth,
              (targetHeight - CANVAS_PADDING * 2) / animation.symbol.sourceHeight,
            ) * (visual.scale ?? 1);

          sprite.anchor.set(0.5);
          sprite.scale.set(scale);
          sprite.position.set(centerX, centerY);
          app.stage.addChild(sprite);
          continue;
        }

        const aliases = registerSpineSymbolAssets(animation.symbol);

        await Assets.load([aliases.skeleton, aliases.atlas]);

        if (cancelled) {
          return;
        }

        const loadedAliases = getSpineAssetAliases(animation.symbol);
        const spine = Spine.from({
          skeleton: loadedAliases.skeleton,
          atlas: loadedAliases.atlas,
          autoUpdate: true,
        });
        const maxWidth = targetWidth - CANVAS_PADDING * 2;
        const maxHeight = targetHeight - CANVAS_PADDING * 2;
        const scale =
          Math.min(
            maxWidth / animation.symbol.bounds.width,
            maxHeight / animation.symbol.bounds.height,
          ) * (visual.scale ?? 1);

        spine.scale.set(scale);
        spine.position.set(
          centerX - (animation.symbol.bounds.x + animation.symbol.bounds.width / 2) * scale,
          centerY - (animation.symbol.bounds.y + animation.symbol.bounds.height / 2) * scale,
        );
        spine.state.setAnimation(0, animation.symbol.animation, true);
        applyVisibleSlotMask(spine, animation.symbol);
        app.stage.addChild(spine);
      }

      onReadyRef.current?.();
    }

    void renderOverlay();

    return () => {
      cancelled = true;
    };
  }, [appReady, mode, reelSnapshots, winningItemIndex]);

  useEffect(() => {
    if (!appReady) {
      return undefined;
    }

    const app = appRef.current;
    const container = containerRef.current;

    if (!app || !container) {
      return undefined;
    }

    const resizeRenderer = () => {
      const rect = container.getBoundingClientRect();

      app.renderer.resize(
        Math.max(1, Math.round(rect.width)),
        Math.max(1, Math.round(rect.height)),
      );
    };
    const resizeObserver = new ResizeObserver(resizeRenderer);

    resizeRenderer();
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [appReady]);

  return <div className="slot-animation-overlay" ref={containerRef} />;
}

export default SlotAnimationOverlay;

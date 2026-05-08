import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Application, Assets } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { registerSpineSymbolAssets } from "./spineAssets";
import type { SpineSlotSymbol as SpineSlotSymbolConfig } from "./spineSlotItems.constants";
import "./SpineSlotSymbol.scss";

type SpineSlotSymbolProps = {
  symbol: SpineSlotSymbolConfig;
  selected: boolean;
  winning: boolean;
  loop?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
};

const CANVAS_PADDING = 10;
const ANIMATION_FPS = 30;
const ANIMATION_STEP = 1 / ANIMATION_FPS;

function getSymbolScale(
  symbol: SpineSlotSymbolConfig,
  canvasWidth: number,
  canvasHeight: number,
) {
  const maxWidth = canvasWidth - CANVAS_PADDING * 2;
  const maxHeight = canvasHeight - CANVAS_PADDING * 2;

  return Math.min(maxWidth / symbol.bounds.width, maxHeight / symbol.bounds.height);
}

function applyVisibleSlotMask(spine: Spine, symbol: SpineSlotSymbolConfig) {
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

function SpineSlotSymbol({
  symbol,
  selected,
  winning,
  loop = false,
  canvasWidth = 108,
  canvasHeight = 108,
}: SpineSlotSymbolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<Spine | null>(null);
  const playRequestRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const stopAnimationFrame = useCallback(() => {
    playRequestRef.current += 1;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const playAnimation = useCallback((spine: Spine) => {
    stopAnimationFrame();

    const playRequest = playRequestRef.current + 1;
    let lastTime: number | null = null;
    let elapsedAnimationTime = 0;

    playRequestRef.current = playRequest;
    spine.state.setAnimation(0, symbol.animation, loop);

    const tick = (time: number) => {
      if (playRequestRef.current !== playRequest) {
        return;
      }

      const lastFrameTime = lastTime ?? time;
      const delta = (time - lastFrameTime) / 1000;
      lastTime = time;
      elapsedAnimationTime += delta;

      while (elapsedAnimationTime >= ANIMATION_STEP) {
        spine.update(ANIMATION_STEP);
        applyVisibleSlotMask(spine, symbol);
        elapsedAnimationTime -= ANIMATION_STEP;
      }

      const currentTrack = spine.state.getCurrent(0);

      if (loop || (currentTrack && !currentTrack.isComplete())) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [loop, stopAnimationFrame, symbol]);

  useEffect(() => {
    let app: Application | null = null;
    let isCancelled = false;
    let isInitialized = false;
    let isDestroyed = false;

    function destroyPixiApp() {
      if (!app || !isInitialized || isDestroyed) return;

      isDestroyed = true;
      stopAnimationFrame();
      app.destroy({ removeView: true }, { children: true });
      app = null;
      spineRef.current = null;
    }

    async function setupSymbol() {
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

      const aliases = registerSpineSymbolAssets(symbol);

      await Assets.load([aliases.skeleton, aliases.atlas]);

      if (isCancelled || isDestroyed) return;

      const spine = Spine.from({
        skeleton: aliases.skeleton,
        atlas: aliases.atlas,
        autoUpdate: false,
      });
      const scale = getSymbolScale(symbol, canvasWidth, canvasHeight);

      spine.scale.set(scale);
      spine.position.set(
        canvasWidth / 2 - (symbol.bounds.x + symbol.bounds.width / 2) * scale,
        canvasHeight / 2 - (symbol.bounds.y + symbol.bounds.height / 2) * scale,
      );
      spine.state.setAnimation(0, symbol.animation, false);
      spine.update(0);
      applyVisibleSlotMask(spine, symbol);

      spineRef.current = spine;
      pixiApp.stage.addChild(spine);

      if (selected && winning) {
        playAnimation(spine);
      }
    }

    setupSymbol().catch((error: unknown) => {
      console.error(`Failed to load ${symbol.name} Spine symbol`, error);
    });

    return () => {
      isCancelled = true;
      destroyPixiApp();
    };
  }, [
    canvasHeight,
    canvasWidth,
    playAnimation,
    selected,
    stopAnimationFrame,
    symbol,
    winning,
  ]);

  useEffect(() => {
    const spine = spineRef.current;

    if (!spine || !selected || !winning) {
      stopAnimationFrame();
      return undefined;
    }

    playAnimation(spine);

    return () => {
      stopAnimationFrame();
    };
  }, [playAnimation, selected, stopAnimationFrame, symbol.animation, winning]);

  return <div className="spine-slot-symbol" ref={containerRef} aria-hidden="true" />;
}

export default SpineSlotSymbol;

import { AnimatedSprite, Application } from "pixi.js";
import { useEffect, useRef } from "react";
import { loadFrameByFrameAssets } from "./frameByFrameAssets";
import "./FrameByFrameSlotSymbol.scss";

export type FrameByFrameSlotSymbolConfig = {
  id: string;
  name: string;
  jsonPath: string;
  imagePath: string;
  sourceWidth: number;
  sourceHeight: number;
  fps?: number;
};

type FrameByFrameSlotSymbolProps = {
  symbol: FrameByFrameSlotSymbolConfig;
  playing?: boolean;
  onReady?: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
};

const CANVAS_PADDING = 8;
const DEFAULT_FPS = 30;

function FrameByFrameSlotSymbol({
  symbol,
  playing = false,
  onReady,
  canvasWidth = 108,
  canvasHeight = 108,
}: FrameByFrameSlotSymbolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedSymbolRef = useRef<AnimatedSprite | null>(null);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    let app: Application | null = null;
    let isCancelled = false;
    let isInitialized = false;
    let isDestroyed = false;

    function destroyPixiApp() {
      if (!app || !isInitialized || isDestroyed) return;

      isDestroyed = true;
      app.destroy({ removeView: true }, { children: true });
      app = null;
    }

    async function setupAnimation() {
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

      const { frames } = await loadFrameByFrameAssets(symbol);

      if (isCancelled || isDestroyed) return;

      const animatedSymbol = new AnimatedSprite({
        textures: frames,
        animationSpeed: (symbol.fps ?? DEFAULT_FPS) / 60,
        autoPlay: false,
        loop: true,
        updateAnchor: true,
      });
      const scale = Math.min(
        (canvasWidth - CANVAS_PADDING * 2) / symbol.sourceWidth,
        (canvasHeight - CANVAS_PADDING * 2) / symbol.sourceHeight,
      );

      animatedSymbol.anchor.set(0.5);
      animatedSymbol.scale.set(scale);
      animatedSymbol.position.set(canvasWidth / 2, canvasHeight / 2);
      animatedSymbol.gotoAndStop(0);

      animatedSymbolRef.current = animatedSymbol;
      pixiApp.stage.addChild(animatedSymbol);
      onReady?.();

      if (playingRef.current) {
        animatedSymbol.gotoAndPlay(0);
      }
    }

    setupAnimation().catch((error: unknown) => {
      console.error(`Failed to load ${symbol.name} frame-by-frame animation`, error);
    });

    return () => {
      isCancelled = true;
      animatedSymbolRef.current = null;
      destroyPixiApp();
    };
  }, [canvasHeight, canvasWidth, onReady, symbol]);

  useEffect(() => {
    const animatedSymbol = animatedSymbolRef.current;

    if (!animatedSymbol) {
      return;
    }

    if (playing) {
      animatedSymbol.gotoAndPlay(0);
      return;
    }

    animatedSymbol.gotoAndStop(0);
  }, [playing]);

  return (
    <div
      className="frame-by-frame-slot-symbol"
      ref={containerRef}
      aria-hidden="true"
    />
  );
}

export default FrameByFrameSlotSymbol;

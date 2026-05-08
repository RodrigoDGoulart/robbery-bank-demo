import { AnimatedSprite, Application } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import CloseWinPopUpButton from "./CloseWinPopUpButton";
import type { WinPopUpType } from "./WinPopUp.constants";
import { winPopUpAnimations } from "./WinPopUp.constants";
import { loadWinPopUpFrameAssets } from "./winPopUpFrameAssets";
import "./WinPopUp.scss";

type WinPopUpProps = {
  type: WinPopUpType;
  onClose: () => void;
};

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 820;
const CANVAS_PADDING = 18;
const CLOSE_BUTTON_DELAY_MS = 1000;

function getAnimationScale(sourceWidth: number, sourceHeight: number) {
  const maxWidth = CANVAS_WIDTH - CANVAS_PADDING * 2;
  const maxHeight = CANVAS_HEIGHT - CANVAS_PADDING * 2;

  return Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
}

function fitPixiCanvasToContainer(canvas: HTMLCanvasElement) {
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.maxWidth = "100%";
  canvas.style.maxHeight = "100%";
}

function WinPopUp({ type, onClose }: WinPopUpProps) {
  const animation = useMemo(() => winPopUpAnimations[type], [type]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [closeButtonReadyType, setCloseButtonReadyType] =
    useState<WinPopUpType | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setCloseButtonReadyType(type);
    }, CLOSE_BUTTON_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [type]);

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
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
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
      fitPixiCanvasToContainer(pixiApp.canvas);

      const { frames, sourceHeight, sourceWidth } =
        await loadWinPopUpFrameAssets(animation);

      if (isCancelled || isDestroyed) return;

      const animatedWin = new AnimatedSprite({
        textures: frames,
        animationSpeed: animation.fps / 60,
        autoPlay: true,
        loop: true,
        updateAnchor: true,
      });
      const scale = getAnimationScale(sourceWidth, sourceHeight);

      animatedWin.anchor.set(0.5);
      animatedWin.scale.set(scale);
      animatedWin.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

      pixiApp.stage.addChild(animatedWin);
    }

    setupAnimation().catch((error: unknown) => {
      console.error(`Failed to load ${animation.label} animation`, error);
    });

    return () => {
      isCancelled = true;
      destroyPixiApp();
    };
  }, [animation]);

  const showCloseButton = closeButtonReadyType === type;

  return (
    <div
      aria-label={animation.label}
      aria-modal="true"
      className="win-popup"
      role="dialog"
    >
      <div className="win-popup__stage">
        {showCloseButton && <CloseWinPopUpButton onClick={onClose} />}
        <div
          className="win-popup__animation"
          ref={containerRef}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default WinPopUp;

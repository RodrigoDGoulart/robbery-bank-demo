import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Application, Assets } from "pixi.js";
import { useEffect, useRef } from "react";
import "./Fox.scss";

const FOX_ASSET_PATH = "/SpineFiles/Fox";
const FOX_SKELETON_PATH = `${FOX_ASSET_PATH}/Fox.json`;
const FOX_ATLAS_PATH = `${FOX_ASSET_PATH}/Fox.atlas`;
const FOX_SKELETON_ALIAS = "foxSkeleton";
const FOX_ATLAS_ALIAS = "foxAtlas";
const FOX_ANIMATION = "Idle";
const FOX_CANVAS_WIDTH = 340;
const FOX_CANVAS_HEIGHT = 520;
const FOX_SCALE = 0.19;
const FOX_CANVAS_PADDING = 8;
const FOX_ANIMATION_FPS = 30;
const FOX_ANIMATION_STEP = 1 / FOX_ANIMATION_FPS;
const FOX_SKELETON_BOUNDS = {
  x: -896.42,
  y: -1321.83,
  width: 1736.42,
};

function registerFoxAssets() {
  if (!Assets.resolver.hasKey(FOX_SKELETON_ALIAS)) {
    Assets.add({
      alias: FOX_SKELETON_ALIAS,
      src: FOX_SKELETON_PATH,
    });
  }

  if (!Assets.resolver.hasKey(FOX_ATLAS_ALIAS)) {
    Assets.add({
      alias: FOX_ATLAS_ALIAS,
      src: FOX_ATLAS_PATH,
    });
  }
}

function Fox() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    async function setupFoxAnimation() {
      const container = containerRef.current;

      if (!container) return;

      const pixiApp = new Application();
      app = pixiApp;

      await pixiApp.init({
        width: FOX_CANVAS_WIDTH,
        height: FOX_CANVAS_HEIGHT,
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

      registerFoxAssets();

      await Assets.load([FOX_SKELETON_ALIAS, FOX_ATLAS_ALIAS]);

      if (isCancelled || isDestroyed) return;

      const fox = Spine.from({
        skeleton: FOX_SKELETON_ALIAS,
        atlas: FOX_ATLAS_ALIAS,
        autoUpdate: false,
      });

      fox.state.setAnimation(0, FOX_ANIMATION, true);
      fox.scale.set(FOX_SCALE);
      fox.position.set(
        -FOX_SKELETON_BOUNDS.x * FOX_SCALE + FOX_CANVAS_PADDING,
        -FOX_SKELETON_BOUNDS.y * FOX_SCALE + FOX_CANVAS_PADDING
      );

      pixiApp.stage.addChild(fox);

      let elapsedAnimationTime = 0;

      pixiApp.ticker.add((ticker) => {
        elapsedAnimationTime += ticker.deltaMS / 1000;

        while (elapsedAnimationTime >= FOX_ANIMATION_STEP) {
          fox.update(FOX_ANIMATION_STEP);
          elapsedAnimationTime -= FOX_ANIMATION_STEP;
        }
      });
    }

    setupFoxAnimation().catch((error: unknown) => {
      console.error("Failed to load Fox Spine animation", error);
    });

    return () => {
      isCancelled = true;
      destroyPixiApp();
    };
  }, []);

  return <div className="fox" ref={containerRef} aria-hidden="true" />;
}

export default Fox;

import { AnimatedSprite, Application, Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";
import { useEffect, useRef } from "react";
import "./Fox.scss";

const FOX_ASSET_PATH = "/SpineFiles/Fox";
const FOX_SPRITESHEET_PATH = `${FOX_ASSET_PATH}/fox.json`;
const FOX_IMAGE_PATH = `${FOX_ASSET_PATH}/fox.png`;
const FOX_CANVAS_WIDTH = 340;
const FOX_CANVAS_HEIGHT = 520;
const FOX_ANIMATION_FPS = 30;

function getSortedFoxFrameNames(frames: SpritesheetData["frames"]) {
  return Object.keys(frames).sort((leftFrameName, rightFrameName) => {
    const leftIndex = Number(leftFrameName.split("_").at(-1));
    const rightIndex = Number(rightFrameName.split("_").at(-1));

    return leftIndex - rightIndex;
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image ${src}`));
    image.src = src;
  });
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

      const [spritesheetResponse, image] = await Promise.all([
        fetch(FOX_SPRITESHEET_PATH),
        loadImageElement(FOX_IMAGE_PATH),
      ]);

      if (isCancelled || isDestroyed) return;

      const spritesheetData =
        (await spritesheetResponse.json()) as SpritesheetData;
      const texture = Texture.from(image);
      const spritesheet = new Spritesheet(texture, spritesheetData);

      await spritesheet.parse();

      if (isCancelled || isDestroyed) return;

      const frameNames = getSortedFoxFrameNames(spritesheetData.frames);
      const frames = frameNames.map((frameName) => spritesheet.textures[frameName]);
      const fox = new AnimatedSprite({
        textures: frames,
        animationSpeed: FOX_ANIMATION_FPS / 60,
        autoPlay: true,
        loop: true,
        updateAnchor: true,
      });

      fox.anchor.set(0.5);
      fox.scale.set(Math.min(FOX_CANVAS_WIDTH / 425, FOX_CANVAS_HEIGHT / 582));
      fox.position.set(FOX_CANVAS_WIDTH / 2, FOX_CANVAS_HEIGHT / 2);

      pixiApp.stage.addChild(fox);
    }

    setupFoxAnimation().catch((error: unknown) => {
      console.error("Failed to load Fox frame-by-frame animation", error);
    });

    return () => {
      isCancelled = true;
      destroyPixiApp();
    };
  }, []);

  return <div className="fox" ref={containerRef} aria-hidden="true" />;
}

export default Fox;

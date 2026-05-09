import { AnimatedSprite, Application, Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import "./Fox.scss";

const FOX_ASSET_PATH = "/SpineFiles/Fox";
const FOX_SPRITESHEET_PATH = `${FOX_ASSET_PATH}/Fox.json`;
const FOX_IMAGE_PATH = `${FOX_ASSET_PATH}/Fox.png`;
const FOX_WIN_SPRITESHEET_PATH = `${FOX_ASSET_PATH}/fox_win.json`;
const FOX_WIN_IMAGE_PATH = `${FOX_ASSET_PATH}/fox_win.png`;
const FOX_CANVAS_WIDTH = 340;
const FOX_CANVAS_HEIGHT = 520;
const FOX_ANIMATION_FPS = 30;

type FoxProps = {
  haveWinned?: boolean;
  onHaveWinnedChange?: (haveWinned: boolean) => void;
};

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

async function loadFoxFrames(spritesheetPath: string, imagePath: string) {
  const [spritesheetResponse, image] = await Promise.all([
    fetch(spritesheetPath),
    loadImageElement(imagePath),
  ]);
  const spritesheetData = (await spritesheetResponse.json()) as SpritesheetData;
  const texture = Texture.from(image);
  const spritesheet = new Spritesheet(texture, spritesheetData);

  await spritesheet.parse();

  return getSortedFoxFrameNames(spritesheetData.frames).map(
    (frameName) => spritesheet.textures[frameName],
  );
}

function Fox({ haveWinned = false, onHaveWinnedChange }: FoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foxRef = useRef<AnimatedSprite | null>(null);
  const idleFramesRef = useRef<Texture[]>([]);
  const winFramesRef = useRef<Texture[]>([]);
  const pendingWinRef = useRef(false);
  const playingWinRef = useRef(false);
  const playIdleLoopRef = useRef<() => void>(() => undefined);
  const playWinOnceRef = useRef<() => void>(() => undefined);

  const playIdleLoop = useCallback(() => {
    const fox = foxRef.current;

    if (!fox || idleFramesRef.current.length === 0) return;

    fox.textures = idleFramesRef.current;
    fox.loop = true;
    fox.onComplete = undefined;
    fox.onLoop = () => {
      if (!pendingWinRef.current) return;

      playWinOnceRef.current();
    };
    fox.gotoAndPlay(0);
  }, []);

  const playWinOnce = useCallback(() => {
    const fox = foxRef.current;

    if (!fox || winFramesRef.current.length === 0) return;

    pendingWinRef.current = false;
    playingWinRef.current = true;
    fox.textures = winFramesRef.current;
    fox.loop = false;
    fox.onLoop = undefined;
    fox.onComplete = () => {
      playingWinRef.current = false;
      playIdleLoopRef.current();
    };
    fox.gotoAndPlay(0);
  }, []);

  useEffect(() => {
    playIdleLoopRef.current = playIdleLoop;
    playWinOnceRef.current = playWinOnce;
  }, [playIdleLoop, playWinOnce]);

  useEffect(() => {
    if (!haveWinned) return;

    console.log("ganhou!");
    pendingWinRef.current = true;

    onHaveWinnedChange?.(false);
  }, [haveWinned, onHaveWinnedChange]);

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

      const [idleFrames, winFrames] = await Promise.all([
        loadFoxFrames(FOX_SPRITESHEET_PATH, FOX_IMAGE_PATH),
        loadFoxFrames(FOX_WIN_SPRITESHEET_PATH, FOX_WIN_IMAGE_PATH),
      ]);

      if (isCancelled || isDestroyed) return;

      idleFramesRef.current = idleFrames;
      winFramesRef.current = winFrames;
      const fox = new AnimatedSprite({
        textures: idleFrames,
        animationSpeed: FOX_ANIMATION_FPS / 60,
        autoPlay: true,
        loop: true,
        updateAnchor: true,
      });

      fox.anchor.set(0.5);
      fox.scale.set(Math.min(FOX_CANVAS_WIDTH / 425, FOX_CANVAS_HEIGHT / 582));
      fox.position.set(FOX_CANVAS_WIDTH / 2, FOX_CANVAS_HEIGHT / 2);

      foxRef.current = fox;
      pixiApp.stage.addChild(fox);
      playIdleLoop();
    }

    setupFoxAnimation().catch((error: unknown) => {
      console.error("Failed to load Fox frame-by-frame animation", error);
    });

    return () => {
      isCancelled = true;
      foxRef.current = null;
      destroyPixiApp();
    };
  }, [playIdleLoop]);

  return <div className="fox" ref={containerRef} aria-hidden="true" />;
}

export default Fox;

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import FrameByFrameSlotSymbol from "../FrameByFrameSlotSymbol";
import {
  getLoadedFrameByFramePreviewSrc,
  loadFrameByFramePreviewSrc,
} from "../FrameByFrameSlotSymbol/frameByFrameAssets";
import SpineSlotSymbol from "../SpineSlotSymbol";
import type {
  SlotItemConfig,
  SlotItemVisualConfig,
} from "../SlotItem/SlotItem.constants";
import "./SlotItem.scss";

type SlotItemProps = {
  item: SlotItemConfig;
  selected: boolean;
  winning: boolean;
};

function getVisualStyle(visual: SlotItemVisualConfig): CSSProperties {
  const translateX = visual.translateX ?? 0;
  const translateY = visual.translateY ?? 0;
  const scale = visual.scale ?? 1;

  return {
    width: visual.width,
    height: visual.height,
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
  };
}

function getInitialPreviewSrc(item: SlotItemConfig) {
  if (item.animation?.type === "frame-by-frame") {
    return getLoadedFrameByFramePreviewSrc(item.animation.symbol) ?? "";
  }

  return item.staticImage.src;
}

function useSlotItemPreviewSrc(item: SlotItemConfig) {
  const [previewSrc, setPreviewSrc] = useState(() => getInitialPreviewSrc(item));

  useEffect(() => {
    let cancelled = false;

    if (item.animation?.type !== "frame-by-frame") {
      return undefined;
    }

    void loadFrameByFramePreviewSrc(item.animation.symbol).then((loadedSrc) => {
      if (!cancelled) {
        setPreviewSrc(loadedSrc);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item]);

  return previewSrc || item.staticImage.src;
}

function SlotItem({ item, selected, winning }: SlotItemProps) {
  const animation = item.animation;
  const playing = selected && winning;
  const previewSrc = useSlotItemPreviewSrc(item);
  const [animationReady, setAnimationReady] = useState(false);
  const handleAnimationReady = useCallback(() => {
    setAnimationReady(true);
  }, []);

  useEffect(() => {
    if (!playing) {
      queueMicrotask(() => setAnimationReady(false));
    }
  }, [playing]);

  if (animation) {
    const animationStyle = getVisualStyle(animation.visual);
    const canvasWidth =
      typeof animation.visual.width === "number"
        ? animation.visual.width
        : undefined;
    const canvasHeight =
      typeof animation.visual.height === "number"
        ? animation.visual.height
        : undefined;

    return (
      <div
        className={[
          "slot-item",
          "slot-item--animation",
          playing ? "slot-item--playing" : "",
          selected ? "slot-item--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={animationStyle}
        aria-label={item.name}
      >
        <img
          className={[
            "slot-item__preview",
            animationReady ? "slot-item__preview--hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          src={previewSrc}
          alt={item.name}
          draggable={false}
        />

        {playing && (
          <div
            className={[
              "slot-item__animation-layer",
              animationReady ? "slot-item__animation-layer--ready" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {animation.type === "frame-by-frame" ? (
              <FrameByFrameSlotSymbol
                canvasHeight={canvasHeight}
                canvasWidth={canvasWidth}
                onReady={handleAnimationReady}
                playing={playing}
                symbol={animation.symbol}
              />
            ) : (
              <SpineSlotSymbol
                canvasHeight={canvasHeight}
                canvasWidth={canvasWidth}
                loop
                onReady={handleAnimationReady}
                playing={playing}
                symbol={animation.symbol}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      className={[
        "slot-item",
        "slot-item--static",
        selected ? "slot-item--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={getVisualStyle(item.staticImage.visual)}
      src={previewSrc}
      alt={item.name}
      draggable={false}
    />
  );
}

export default SlotItem;

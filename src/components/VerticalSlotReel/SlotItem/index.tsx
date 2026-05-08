import type { CSSProperties } from "react";
import FrameByFrameSlotSymbol from "../FrameByFrameSlotSymbol";
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

function SlotItem({ item, selected, winning }: SlotItemProps) {
  const animation = selected && winning ? item.animation : undefined;

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
      <div className="slot-item slot-item--animation" style={animationStyle}>
        {animation.type === "frame-by-frame" ? (
          <FrameByFrameSlotSymbol
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            symbol={animation.symbol}
          />
        ) : (
          <SpineSlotSymbol
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            loop
            selected={selected}
            symbol={animation.symbol}
            winning={winning}
          />
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
      src={item.staticImage.src}
      alt={item.name}
      draggable={false}
    />
  );
}

export default SlotItem;

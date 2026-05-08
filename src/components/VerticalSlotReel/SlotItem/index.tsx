import type { CSSProperties } from "react";
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

function SlotItem({ item, selected }: SlotItemProps) {
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

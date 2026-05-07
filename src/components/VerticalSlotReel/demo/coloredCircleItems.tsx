import type { CSSProperties } from "react";
import type { VerticalSlotReelItem } from "../";
import "./coloredCircleItems.scss";

const circles = [
  { id: "red", color: "#e83c3c" },
  { id: "green", color: "#42c66a" },
  { id: "blue", color: "#3f8cff" },
  { id: "yellow", color: "#f2cb45" },
  { id: "pink", color: "#e45acf" },
  { id: "cyan", color: "#36d3d8" },
];

export const coloredCircleItems: VerticalSlotReelItem[] = circles.map(
  ({ id, color }) => ({
    id,
    render: ({ selected, winning }) => (
      <div
        className={[
          "colored-slot-circle",
          selected ? "colored-slot-circle--selected" : "",
          winning ? "colored-slot-circle--winning" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ "--circle-color": color } as CSSProperties}
      />
    ),
    onSelect: () => {
      console.info(`Selected slot item: ${id}`);
    },
  }),
);

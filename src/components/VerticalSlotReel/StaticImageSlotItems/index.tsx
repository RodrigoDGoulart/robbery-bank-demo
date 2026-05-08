import type { VerticalSlotReelItem } from "..";
import SlotItem from "../SlotItem";
import { slotItemConfigs } from "../SlotItem/SlotItem.constants";

export const staticImageSlotItems: VerticalSlotReelItem[] = slotItemConfigs.map(
  (item) => ({
    id: item.id,
    render: ({ selected, winning }) => (
      <SlotItem item={item} selected={selected} winning={winning} />
    ),
    onSelect: () => {
      console.info(`Selected slot item: ${item.name}`);
    },
  }),
);

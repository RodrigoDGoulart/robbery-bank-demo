import type { FrameByFrameSlotSymbolConfig } from "../FrameByFrameSlotSymbol";
import type { SpineSlotSymbol } from "../SpineSlotSymbol/spineSlotItems.constants";

export type SlotItemVisualConfig = {
  width?: number | string;
  height?: number | string;
  translateX?: number;
  translateY?: number;
  scale?: number;
};

export type SlotItemConfig = {
  id: string;
  name: string;
  staticImage: {
    src: string;
    visual: SlotItemVisualConfig;
  };
  animation?: {
    visual: SlotItemVisualConfig;
  } & (
    | {
        type: "frame-by-frame";
        symbol: FrameByFrameSlotSymbolConfig;
      }
    | {
        type: "spine";
        symbol: SpineSlotSymbol;
      }
  );
};

const REEL_ITEM_PATH = "/static_images/reel_itens";

const defaultStaticVisual: SlotItemVisualConfig = {
  width: 104,
  height: 104,
};

const defaultCanvasVisual: SlotItemVisualConfig = {
  width: 108,
  height: 108,
};

export const slotItemConfigs: SlotItemConfig[] = [
  {
    id: "letter-a",
    name: "Letter A",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Littera_A_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "letter-a",
        name: "Letter A",
        jsonPath: "/SpineFiles/letter-a/letter-a.json",
        imagePath: "/SpineFiles/letter-a/letter-a.png",
        sourceWidth: 197,
        sourceHeight: 185,
        fps: 30,
      },
    },
  },
  {
    id: "letter-j",
    name: "Letter J",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Littera_J_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "letter-j",
        name: "Letter J",
        jsonPath: "/SpineFiles/letter-j/letter-j.json",
        imagePath: "/SpineFiles/letter-j/letter-j.png",
        sourceWidth: 197,
        sourceHeight: 185,
        fps: 30,
      },
    },
  },
  {
    id: "letter-k",
    name: "Letter K",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Littera_K_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "letter-k",
        name: "Letter K",
        jsonPath: "/SpineFiles/letter-k/letter-k.json",
        imagePath: "/SpineFiles/letter-k/letter-k.png",
        sourceWidth: 197,
        sourceHeight: 185,
        fps: 30,
      },
    },
  },
  {
    id: "letter-q",
    name: "Letter Q",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Littera_Q_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "letter-q",
        name: "Letter Q",
        jsonPath: "/SpineFiles/letter-q/letter-q.json",
        imagePath: "/SpineFiles/letter-q/letter-q.png",
        sourceWidth: 197,
        sourceHeight: 185,
        fps: 30,
      },
    },
  },
  {
    id: "number-10",
    name: "Number 10",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Number_10_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "number-10",
        name: "Number 10",
        jsonPath: "/SpineFiles/number-10/number-10.json",
        imagePath: "/SpineFiles/number-10/number-10.png",
        sourceWidth: 180,
        sourceHeight: 169,
        fps: 30,
      },
    },
  },
  {
    id: "bank",
    name: "Bank",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Bank_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "spine",
      visual: defaultCanvasVisual,
      symbol: {
        id: "bank",
        name: "Bank",
        folder: "Bank",
        skeletonFile: "Bank.json",
        atlasFile: "Bank.atlas",
        animation: "Bank",
        bounds: { x: -437, y: -385, width: 910, height: 792 },
      },
    },
  },
  {
    id: "cell",
    name: "Cell",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Cell_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "cell",
        name: "Cell",
        jsonPath: "/SpineFiles/Cell/cell.json",
        imagePath: "/SpineFiles/Cell/cell.png",
        sourceWidth: 188,
        sourceHeight: 124,
        fps: 30,
      },
    },
  },
  {
    id: "dynamit",
    name: "Dynamit",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Dynamit_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "dynamit",
        name: "Dynamit",
        jsonPath: "/SpineFiles/Dynamit/dynamit.json",
        imagePath: "/SpineFiles/Dynamit/dynamit.png",
        sourceWidth: 279,
        sourceHeight: 281,
        fps: 30,
      },
    },
  },
  {
    id: "handcuffs",
    name: "Handcuffs",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Handcuffs_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "frame-by-frame",
      visual: defaultCanvasVisual,
      symbol: {
        id: "handcuffs",
        name: "Handcuffs",
        jsonPath: "/SpineFiles/Handcuffs/handcuffs.json",
        imagePath: "/SpineFiles/Handcuffs/handcuffs.png",
        sourceWidth: 182,
        sourceHeight: 167,
        fps: 30,
      },
    },
  },
  {
    id: "safe",
    name: "Safe",
    staticImage: {
      src: `${REEL_ITEM_PATH}/Safe_00.png`,
      visual: defaultStaticVisual,
    },
    animation: {
      type: "spine",
      visual: defaultCanvasVisual,
      symbol: {
        id: "safe",
        name: "Safe",
        folder: "Safe",
        skeletonFile: "Safe.json",
        atlasFile: "Safe.atlas",
        animation: "animation",
        bounds: { x: -511.72, y: -531.42, width: 947.72, height: 1006.42 },
      },
    },
  },
];

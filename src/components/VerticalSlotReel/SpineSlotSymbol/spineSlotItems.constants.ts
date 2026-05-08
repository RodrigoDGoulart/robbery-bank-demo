export type SpineSlotSymbol = {
  id: string;
  name: string;
  folder: string;
  skeletonFile: string;
  atlasFile: string;
  animation: string;
  visibleSlotPrefixes?: string[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const spineSlotSymbols: SpineSlotSymbol[] = [
  {
    id: "bank",
    name: "Bank",
    folder: "Bank",
    skeletonFile: "Bank.json",
    atlasFile: "Bank.atlas",
    animation: "Bank",
    bounds: { x: -437, y: -385, width: 910, height: 792 },
  },
  {
    id: "safe",
    name: "Safe",
    folder: "Safe",
    skeletonFile: "Safe.json",
    atlasFile: "Safe.atlas",
    animation: "animation",
    bounds: { x: -511.72, y: -531.42, width: 947.72, height: 1006.42 },
  },
];

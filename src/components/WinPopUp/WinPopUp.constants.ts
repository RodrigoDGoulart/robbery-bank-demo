export type WinPopUpType = "big" | "total" | "mega" | "superMega";

export type WinPopUpSheet = {
  jsonPath: string;
  imagePath: string;
};

export type WinPopUpAnimation = {
  id: WinPopUpType;
  label: string;
  sheets: WinPopUpSheet[];
  fps: number;
};

export const winPopUpAnimations: Record<WinPopUpType, WinPopUpAnimation> = {
  big: {
    id: "big",
    label: "Big Win",
    sheets: [
      {
        jsonPath: "/SpineFiles/Big_Win/bigwin-0.json",
        imagePath: "/SpineFiles/Big_Win/bigwin-0.png",
      },
      {
        jsonPath: "/SpineFiles/Big_Win/bigwin-1.json",
        imagePath: "/SpineFiles/Big_Win/bigwin-1.png",
      },
    ],
    fps: 30,
  },
  total: {
    id: "total",
    label: "Total Win",
    sheets: [
      {
        jsonPath: "/SpineFiles/Total_Win/totalwin-0.json",
        imagePath: "/SpineFiles/Total_Win/totalwin-0.png",
      },
      {
        jsonPath: "/SpineFiles/Total_Win/totalwin-1.json",
        imagePath: "/SpineFiles/Total_Win/totalwin-1.png",
      },
    ],
    fps: 30,
  },
  mega: {
    id: "mega",
    label: "Mega Win",
    sheets: [
      {
        jsonPath: "/SpineFiles/Mega_Win/megawin-0.json",
        imagePath: "/SpineFiles/Mega_Win/megawin-0.png",
      },
      {
        jsonPath: "/SpineFiles/Mega_Win/megawin-1.json",
        imagePath: "/SpineFiles/Mega_Win/megawin-1.png",
      },
    ],
    fps: 30,
  },
  superMega: {
    id: "superMega",
    label: "Super Mega Win",
    sheets: [
      {
        jsonPath: "/SpineFiles/Super_Mega_Win/supermegawin-0.json",
        imagePath: "/SpineFiles/Super_Mega_Win/supermegawin-0.png",
      },
      {
        jsonPath: "/SpineFiles/Super_Mega_Win/supermegawin-1.json",
        imagePath: "/SpineFiles/Super_Mega_Win/supermegawin-1.png",
      },
    ],
    fps: 30,
  },
};

export const winningSlotPopUps: Record<number, WinPopUpType> = {
  0: "superMega",
  1: "big",
  2: "mega",
  3: "total",
};

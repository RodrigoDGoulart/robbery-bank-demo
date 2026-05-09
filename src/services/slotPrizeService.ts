export type SlotPrize = {
  name: string;
  chancePercent: number;
  resultIndex: number;
};

export type DrawSlotPrizeOptions = {
  delayMs?: number;
  mode?: SlotPrizeDrawMode | null;
};

export type SlotPrizeDrawMode =
  | "bad-luck"
  | "j"
  | "q"
  | "k"
  | "a"
  | "10"
  | "bank"
  | "safe"
  | "cell"
  | "handcuffs"
  | "dynamite";

export type DrawSlotPrizeResult =
  | {
      hasPrize: true;
      prize: SlotPrize;
    }
  | {
      hasPrize: false;
      prize: null;
    };

const defaultSlotPrizes: SlotPrize[] = [
  { name: "Letter A", chancePercent: 0.5, resultIndex: 0 },
  { name: "Letter K", chancePercent: 1, resultIndex: 2 },
  { name: "Letter Q", chancePercent: 1.5, resultIndex: 3 },
  { name: "Letter J", chancePercent: 2, resultIndex: 1 },
  { name: "Number 10", chancePercent: 5, resultIndex: 4 },
  { name: "Bank", chancePercent: 5, resultIndex: 5 },
  { name: "Safe", chancePercent: 5, resultIndex: 9 },
  { name: "Cell", chancePercent: 10, resultIndex: 6 },
  { name: "Handcuffs", chancePercent: 10, resultIndex: 8 },
  { name: "Dynamit", chancePercent: 10, resultIndex: 7 },
];

const resultIndexByMode: Record<Exclude<SlotPrizeDrawMode, "bad-luck">, number> =
  {
    a: 0,
    j: 1,
    k: 2,
    q: 3,
    "10": 4,
    bank: 5,
    cell: 6,
    dynamite: 7,
    handcuffs: 8,
    safe: 9,
  };

const slotPrizeDrawModes = new Set<SlotPrizeDrawMode>([
  "bad-luck",
  "j",
  "q",
  "k",
  "a",
  "10",
  "bank",
  "safe",
  "cell",
  "handcuffs",
  "dynamite",
]);

function wait(delayMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

function getSlotPrizesByMode(mode?: SlotPrizeDrawMode | null) {
  if (!mode) {
    return defaultSlotPrizes;
  }

  if (mode === "bad-luck") {
    return defaultSlotPrizes.map((prize) => ({
      ...prize,
      chancePercent: 0,
    }));
  }

  const winningResultIndex = resultIndexByMode[mode];

  return defaultSlotPrizes.map((prize) => ({
    ...prize,
    chancePercent: prize.resultIndex === winningResultIndex ? 100 : 0,
  }));
}

function getSlotPrizeDrawModeFromQuery() {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (!mode) {
    return null;
  }

  const normalizedMode = mode.toLowerCase();

  return slotPrizeDrawModes.has(normalizedMode as SlotPrizeDrawMode)
    ? (normalizedMode as SlotPrizeDrawMode)
    : null;
}

function pickPrizeByChance(slotPrizes: SlotPrize[]) {
  for (const prize of slotPrizes) {
    if (!Number.isFinite(prize.chancePercent) || prize.chancePercent < 0) {
      throw new Error("Slot prize chances must be finite non-negative numbers.");
    }
  }

  const totalChance = slotPrizes.reduce(
    (total, prize) => total + prize.chancePercent,
    0,
  );

  if (totalChance > 100) {
    throw new Error("Slot prize chances cannot add up to more than 100%.");
  }

  let roll = Math.random() * 100;

  for (const prize of slotPrizes) {
    roll -= prize.chancePercent;

    if (roll < 0) {
      return prize;
    }
  }

  return null;
}

export async function drawSlotPrize({
  delayMs = 700,
  mode = getSlotPrizeDrawModeFromQuery(),
}: DrawSlotPrizeOptions = {}): Promise<DrawSlotPrizeResult> {
  await wait(delayMs);

  const prize = pickPrizeByChance(getSlotPrizesByMode(mode));

  if (!prize) {
    return {
      hasPrize: false,
      prize: null,
    };
  }

  return {
    hasPrize: true,
    prize,
  };
}

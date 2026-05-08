export type SlotPrize = {
  name: string;
  chancePercent: number;
  resultIndex: number;
};

export type DrawSlotPrizeOptions = {
  noPrizeChancePercent?: number;
  delayMs?: number;
};

export type DrawSlotPrizeResult =
  | {
      hasPrize: true;
      prize: SlotPrize;
    }
  | {
      hasPrize: false;
      prize: null;
    };

const slotPrizes: SlotPrize[] = [
  { name: "Letter A", chancePercent: 0, resultIndex: 0 },
  { name: "Letter J", chancePercent: 0, resultIndex: 1 },
  { name: "Letter K", chancePercent: 0, resultIndex: 2 },
  { name: "Letter Q", chancePercent: 0, resultIndex: 3 },
  { name: "Number 10", chancePercent: 100, resultIndex: 4 },
  { name: "Bank", chancePercent: 0, resultIndex: 5 },
  { name: "Cell", chancePercent: 0, resultIndex: 6 },
  { name: "Dynamit", chancePercent: 0, resultIndex: 7 },
  { name: "Handcuffs", chancePercent: 0, resultIndex: 8 },
  { name: "Safe", chancePercent: 0, resultIndex: 9 },
];

function wait(delayMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function pickPrizeByChance() {
  const totalChance = slotPrizes.reduce(
    (total, prize) => total + prize.chancePercent,
    0,
  );
  let roll = Math.random() * totalChance;

  for (const prize of slotPrizes) {
    roll -= prize.chancePercent;

    if (roll <= 0) {
      return prize;
    }
  }

  return slotPrizes.at(-1) ?? null;
}

export async function drawSlotPrize({
  noPrizeChancePercent = 0,
  delayMs = 700,
}: DrawSlotPrizeOptions = {}): Promise<DrawSlotPrizeResult> {
  await wait(delayMs);

  if (Math.random() * 100 < clampPercent(noPrizeChancePercent)) {
    return {
      hasPrize: false,
      prize: null,
    };
  }

  const prize = pickPrizeByChance();

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

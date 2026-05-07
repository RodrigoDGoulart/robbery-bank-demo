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
  { name: "Green jackpot", chancePercent: 60, resultIndex: 1 },
  { name: "Blue bonus", chancePercent: 50, resultIndex: 2 },
  { name: "Yellow chest", chancePercent: 25, resultIndex: 3 },
  { name: "Pink rare", chancePercent: 8, resultIndex: 4 },
  { name: "Cyan super rare", chancePercent: 1, resultIndex: 5 },
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
  noPrizeChancePercent = 70,
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

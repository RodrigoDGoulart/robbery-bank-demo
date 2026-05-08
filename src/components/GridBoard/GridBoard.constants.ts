export const REELS_COLUMNS = 6;
export const NO_PRIZE_CHANCE_PERCENT = 0;
export const BANK_RESULT_INDEX = 5;

export const INITIAL_BALANCE = 1000;
export const INITIAL_WIN = 0;

export const BET_VALUES = [1, 10, 100, 1000] as const;

export const GRID_BOARD_VALUE_MAX_LENGTH = {
  balance: 4,
  win: 10,
  bet: 4,
} as const;

export const DEFAULT_PRIZE_VALUE = 10000;

export const SLOT_PRIZE_VALUES_BY_RESULT_INDEX: Record<number, number> = {
  0: 10300000,
  1: 10000,
  2: 130000,
  3: 30000,
};

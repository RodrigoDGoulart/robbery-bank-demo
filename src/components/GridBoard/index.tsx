import { useEffect, useMemo, useRef, useState } from "react";
import Fox from "../Fox";
import JackpotButtons from "../JackpotButtons";
import SlotAnimationOverlay from "../SlotAnimationOverlay";
import VerticalSlotReel from "../VerticalSlotReel";
import WinPopUp from "../WinPopUp";
import { staticImageSlotItems } from "../VerticalSlotReel/StaticImageSlotItems";
import { slotItemConfigs } from "../VerticalSlotReel/SlotItem/SlotItem.constants";
import { drawSlotPrize } from "../../services/slotPrizeService";
import { winningSlotPopUps } from "../WinPopUp/WinPopUp.constants";
import type { WinPopUpType } from "../WinPopUp/WinPopUp.constants";
import {
  BET_VALUES,
  DEFAULT_PRIZE_VALUE,
  GRID_BOARD_VALUE_MAX_LENGTH,
  INITIAL_BALANCE,
  INITIAL_WIN,
  REELS_COLUMNS,
  SLOT_PRIZE_VALUES_BY_RESULT_INDEX,
} from "./GridBoard.constants";
import {
  formatGridBoardValue,
  getNextBetValue,
  getSlotPrizeValue,
} from "../../services/gridBoardValueService";
import "./GridBoard.scss";

const staticImagePath = "/static_images";

const SLOT_OVERLAY_VISIBLE_ROWS = 5;
const SLOT_OVERLAY_WIDTH = 738;
const SLOT_OVERLAY_HEIGHT = 545;
const SLOT_OVERLAY_CELL_WIDTH = 120;
const SLOT_OVERLAY_CELL_HEIGHT = 109;
const SLOT_OVERLAY_COLUMN_GAP = "space-between";
const SLOT_OVERLAY_ROW_GAP = "space-between";
const VALUE_CHANGE_ANIMATION_MS = 600;
const WIN_BALANCE_TRANSFER_DELAY_MS = 750;

type GridBoardValueProps = {
  className: string;
  maxLength: number;
  value: number;
  winPulse?: boolean;
};

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function GridBoardValue({
  className,
  maxLength,
  value,
  winPulse = false,
}: GridBoardValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [changing, setChanging] = useState(false);
  const displayValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const from = displayValueRef.current;
    const to = value;
    const startedAt = performance.now();

    if (from === to) {
      setChanging(false);
      return undefined;
    }

    setChanging(true);

    const tick = (time: number) => {
      const progress = Math.min(
        (time - startedAt) / VALUE_CHANGE_ANIMATION_MS,
        1,
      );
      const nextValue = from + (to - from) * easeOutCubic(progress);
      const roundedValue = Math.round(nextValue);

      displayValueRef.current = roundedValue;
      setDisplayValue(roundedValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      displayValueRef.current = to;
      setDisplayValue(to);
      setChanging(false);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <div
      className={[
        "grid-board-value",
        className,
        changing ? "grid-board-value-changing" : "",
        changing && winPulse ? "grid-board-value-win-pulse" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      ${formatGridBoardValue(displayValue, maxLength)}
    </div>
  );
}

function getRandomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

function getShuffledResultIndexes(totalResults: number, totalReels: number) {
  if (totalResults <= 0) {
    return [];
  }

  const indexes = Array.from({ length: totalResults }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1);
    const currentValue = indexes[index];

    indexes[index] = indexes[swapIndex];
    indexes[swapIndex] = currentValue;
  }

  return Array.from(
    { length: totalReels },
    (_, index) => indexes[index % indexes.length],
  );
}

function createReelItemOrders(totalItems: number, totalReels: number) {
  return Array.from({ length: totalReels }, (_, reelIndex) => {
    const indexes = Array.from({ length: totalItems }, (_, index) => index);

    for (let index = indexes.length - 1; index > 0; index -= 1) {
      const swapIndex = (reelIndex * 3 + index * 5) % (index + 1);
      const currentValue = indexes[index];

      indexes[index] = indexes[swapIndex];
      indexes[swapIndex] = currentValue;
    }

    return indexes;
  });
}

function GridBoard() {
  const reelItemOrders = useMemo(
    () => createReelItemOrders(staticImageSlotItems.length, REELS_COLUMNS),
    [],
  );
  const initialSlotAnimationColumns = useMemo(
    () =>
      reelItemOrders.map((itemOrder) =>
        itemOrder
          .slice(0, SLOT_OVERLAY_VISIBLE_ROWS)
          .map((itemIndex) => slotItemConfigs[itemIndex]),
      ),
    [reelItemOrders],
  );
  const [spinSignal, setSpinSignal] = useState(0);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [win, setWin] = useState(INITIAL_WIN);
  const [bet, setBet] = useState<(typeof BET_VALUES)[number]>(BET_VALUES[1]);
  const [resultIndexes, setResultIndexes] = useState<(number | null)[]>(
    Array.from({ length: REELS_COLUMNS }, () => null),
  );
  const [winning, setWinning] = useState(false);
  const [foxHaveWinned, setFoxHaveWinned] = useState(false);
  const [pendingWinPopUp, setPendingWinPopUp] = useState<WinPopUpType | null>(
    null,
  );
  const [activeWinPopUp, setActiveWinPopUp] = useState<WinPopUpType | null>(
    null,
  );
  const [showInitialSlotAnimation, setShowInitialSlotAnimation] = useState(true);
  const stoppedReelsRef = useRef(0);
  const drawRequestRef = useRef(0);
  const pendingPrizeValueRef = useRef<number | null>(null);
  const payoutTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (payoutTimeoutRef.current !== null) {
        window.clearTimeout(payoutTimeoutRef.current);
      }
    };
  }, []);

  const clearPayoutTimeout = () => {
    if (payoutTimeoutRef.current !== null) {
      window.clearTimeout(payoutTimeoutRef.current);
      payoutTimeoutRef.current = null;
    }
  };

  const handleLeftGreenButton = () => {
    setBet(
      (currentBet) =>
        getNextBetValue(currentBet, BET_VALUES) as (typeof BET_VALUES)[number],
    );
  };

  const handleRedButton = async () => {
    if (balance < bet) {
      return;
    }

    const requestId = drawRequestRef.current + 1;

    clearPayoutTimeout();
    drawRequestRef.current = requestId;
    stoppedReelsRef.current = 0;
    pendingPrizeValueRef.current = null;
    setShowInitialSlotAnimation(false);
    setBalance((currentBalance) => currentBalance - bet);
    setWin(0);
    setWinning(false);
    setFoxHaveWinned(false);
    setPendingWinPopUp(null);
    setActiveWinPopUp(null);
    setResultIndexes(Array.from({ length: REELS_COLUMNS }, () => null));
    setSpinSignal((current) => current + 1);

    const result = await drawSlotPrize();

    if (requestId !== drawRequestRef.current) {
      return;
    }

    if (result.hasPrize) {
      const prizeValue = getSlotPrizeValue(
        result.prize.resultIndex,
        SLOT_PRIZE_VALUES_BY_RESULT_INDEX,
        DEFAULT_PRIZE_VALUE,
      );

      pendingPrizeValueRef.current = prizeValue;
      setWinning(true);
      setPendingWinPopUp(winningSlotPopUps[result.prize.resultIndex] ?? null);
      setResultIndexes(
        Array.from({ length: REELS_COLUMNS }, () => result.prize.resultIndex),
      );
      return;
    }

    setWinning(false);
    setFoxHaveWinned(false);
    pendingPrizeValueRef.current = null;
    setPendingWinPopUp(null);
    setResultIndexes(
      getShuffledResultIndexes(staticImageSlotItems.length, REELS_COLUMNS),
    );
  };

  const handleRightGreenButton = () => {
    clearPayoutTimeout();
    pendingPrizeValueRef.current = null;
    setBalance(INITIAL_BALANCE);
  };

  const handleReelStop = () => {
    stoppedReelsRef.current += 1;

    if (stoppedReelsRef.current >= REELS_COLUMNS && pendingWinPopUp) {
      setActiveWinPopUp(pendingWinPopUp);
      setPendingWinPopUp(null);
    }

    if (stoppedReelsRef.current >= REELS_COLUMNS && pendingPrizeValueRef.current) {
      const prizeValue = pendingPrizeValueRef.current;

      pendingPrizeValueRef.current = null;
      setFoxHaveWinned(true);
      setWin(prizeValue);
      payoutTimeoutRef.current = window.setTimeout(() => {
        setBalance((currentBalance) => currentBalance + prizeValue);
        payoutTimeoutRef.current = null;
      }, WIN_BALANCE_TRANSFER_DELAY_MS);
    }
  };

  return (
    <div className="game-board-container">
      <img
        className="grid-board"
        src={`${staticImagePath}/grid-board.png`}
        alt="Jackpot grid board"
      />

      <GridBoardValue
        className="grid-board-value-balance"
        maxLength={GRID_BOARD_VALUE_MAX_LENGTH.balance}
        value={balance}
      />
      <GridBoardValue
        className="grid-board-value-win"
        maxLength={GRID_BOARD_VALUE_MAX_LENGTH.win}
        value={win}
        winPulse
      />
      <GridBoardValue
        className="grid-board-value-bet"
        maxLength={GRID_BOARD_VALUE_MAX_LENGTH.bet}
        value={bet}
      />

      <Fox
        haveWinned={foxHaveWinned}
        onHaveWinnedChange={setFoxHaveWinned}
      />

      <div className="reels-container">
        {Array.from({ length: REELS_COLUMNS }, (_, i) => (
          <VerticalSlotReel
            key={i}
            itemIndexes={reelItemOrders[i]}
            className={
              showInitialSlotAnimation ? "vertical-slot-reel--initial-hidden" : ""
            }
            items={staticImageSlotItems}
            resultIndex={resultIndexes[i]}
            spinEnabled={!showInitialSlotAnimation}
            spinSignal={spinSignal}
            winning={winning}
            onStop={handleReelStop}
          />
        ))}
      </div>

      {showInitialSlotAnimation && (
        <SlotAnimationOverlay
          className="slot-animation-overlay--grid-board"
          columns={initialSlotAnimationColumns}
          height={SLOT_OVERLAY_HEIGHT}
          width={SLOT_OVERLAY_WIDTH}
          cellHeight={SLOT_OVERLAY_CELL_HEIGHT}
          cellWidth={SLOT_OVERLAY_CELL_WIDTH}
          columnGap={SLOT_OVERLAY_COLUMN_GAP}
          rowGap={SLOT_OVERLAY_ROW_GAP}
          visibleRows={SLOT_OVERLAY_VISIBLE_ROWS}
        />
      )}

      <JackpotButtons
        onLeftGreenClick={handleLeftGreenButton}
        onRedClick={handleRedButton}
        onRightGreenClick={handleRightGreenButton}
        redDisabled={balance < bet}
      />

      {activeWinPopUp && (
        <WinPopUp
          type={activeWinPopUp}
          onClose={() => setActiveWinPopUp(null)}
        />
      )}
    </div>
  );
}

export default GridBoard;

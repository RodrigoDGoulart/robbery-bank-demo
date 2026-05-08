import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fox from "../Fox";
import { preloadFoxAnimations } from "../Fox/foxFrameAssets";
import JackpotButtons from "../JackpotButtons";
import SlotAnimationOverlay from "../SlotAnimationOverlay";
import type { SlotAnimationOverlayMode } from "../SlotAnimationOverlay";
import VerticalSlotReel from "../VerticalSlotReel";
import type { ReelVisibleSnapshot } from "../VerticalSlotReel";
import WinPopUp from "../WinPopUp";
import { staticImageSlotItems } from "../VerticalSlotReel/StaticImageSlotItems";
import {
  preloadSlotItemAnimation,
  preloadSlotItemAnimations,
} from "../VerticalSlotReel/SlotItem/preloadSlotItemAnimations";
import { drawSlotPrize } from "../../services/slotPrizeService";
import { winningSlotPopUps } from "../WinPopUp/WinPopUp.constants";
import type { WinPopUpType } from "../WinPopUp/WinPopUp.constants";
import {
  BET_VALUES,
  DEFAULT_PRIZE_VALUE,
  GRID_BOARD_VALUE_MAX_LENGTH,
  INITIAL_BALANCE,
  INITIAL_WIN,
  NO_PRIZE_CHANCE_PERCENT,
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
  const [spinSignal, setSpinSignal] = useState(0);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [win, setWin] = useState(INITIAL_WIN);
  const [bet, setBet] = useState<(typeof BET_VALUES)[number]>(BET_VALUES[1]);
  const [resultIndexes, setResultIndexes] = useState<(number | null)[]>(
    Array.from({ length: REELS_COLUMNS }, () => null),
  );
  const [winning, setWinning] = useState(false);
  const [slotAnimationsReady, setSlotAnimationsReady] = useState(false);
  const [foxReady, setFoxReady] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);
  const [overlayMode, setOverlayMode] =
    useState<SlotAnimationOverlayMode>("idle");
  const [winningItemIndex, setWinningItemIndex] = useState<number | null>(null);
  const [reelSnapshots, setReelSnapshots] = useState<
    Record<number, ReelVisibleSnapshot>
  >({});
  const [foxHaveWinned, setFoxHaveWinned] = useState(false);
  const [pendingWinPopUp, setPendingWinPopUp] = useState<WinPopUpType | null>(
    null,
  );
  const [activeWinPopUp, setActiveWinPopUp] = useState<WinPopUpType | null>(
    null,
  );
  const stoppedReelsRef = useRef(0);
  const drawRequestRef = useRef(0);
  const pendingPrizeValueRef = useRef<number | null>(null);
  const payoutTimeoutRef = useRef<number | null>(null);
  const snapshotsReady = Object.keys(reelSnapshots).length >= REELS_COLUMNS;
  const gameBoardReady =
    slotAnimationsReady && foxReady && overlayReady && snapshotsReady;
  const hiddenReelCells =
    overlayMode === "idle" ? "all" : overlayMode === "win" ? "center" : "none";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await preloadSlotItemAnimations();
      await preloadFoxAnimations();

      if (!cancelled) {
        setSlotAnimationsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleVisibleCellsChange = useCallback(
    (snapshot: ReelVisibleSnapshot) => {
      if (overlayMode === "idle") {
        setOverlayReady(false);
      }

      setReelSnapshots((currentSnapshots) => ({
        ...currentSnapshots,
        [snapshot.reelIndex]: snapshot,
      }));
    },
    [overlayMode],
  );

  const handleFoxReady = useCallback(() => {
    setFoxReady(true);
  }, []);

  const handleOverlayReady = useCallback(() => {
    setOverlayReady(true);
  }, []);

  const handleRedButton = async () => {
    if (!gameBoardReady || balance < bet) {
      return;
    }

    const requestId = drawRequestRef.current + 1;

    clearPayoutTimeout();
    drawRequestRef.current = requestId;
    stoppedReelsRef.current = 0;
    pendingPrizeValueRef.current = null;
    setOverlayReady(false);
    setOverlayMode("spinning");
    setWinningItemIndex(null);
    setBalance((currentBalance) => currentBalance - bet);
    setWin(0);
    setWinning(false);
    setFoxHaveWinned(false);
    setPendingWinPopUp(null);
    setActiveWinPopUp(null);
    setResultIndexes(Array.from({ length: REELS_COLUMNS }, () => null));
    setSpinSignal((current) => current + 1);

    const result = await drawSlotPrize({
      noPrizeChancePercent: NO_PRIZE_CHANCE_PERCENT,
    });

    if (requestId !== drawRequestRef.current) {
      return;
    }

    if (result.hasPrize) {
      const prizeValue = getSlotPrizeValue(
        result.prize.resultIndex,
        SLOT_PRIZE_VALUES_BY_RESULT_INDEX,
        DEFAULT_PRIZE_VALUE,
      );

      void preloadSlotItemAnimation(result.prize.resultIndex);

      setWinningItemIndex(result.prize.resultIndex);
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
      setOverlayMode("win");
      setFoxHaveWinned(true);
      setWin(prizeValue);
      payoutTimeoutRef.current = window.setTimeout(() => {
        setBalance((currentBalance) => currentBalance + prizeValue);
        payoutTimeoutRef.current = null;
      }, WIN_BALANCE_TRANSFER_DELAY_MS);
    }
  };

  if (!slotAnimationsReady) {
    return (
      <div className="game-board-stage">
        <div className="game-board-loading">carregando...</div>
      </div>
    );
  }

  return (
    <div className="game-board-stage">
      {!gameBoardReady && <div className="game-board-loading">carregando...</div>}

      <div
        className={[
          "game-board-container",
          gameBoardReady ? "" : "game-board-container--preparing",
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
        onReady={handleFoxReady}
        onHaveWinnedChange={setFoxHaveWinned}
      />

      <div
        className={[
          "reels-container",
          gameBoardReady ? "reels-container--ready" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Array.from({ length: REELS_COLUMNS }, (_, i) => (
          <VerticalSlotReel
            key={i}
            height={545}
            hiddenCells={hiddenReelCells}
            itemIndexes={reelItemOrders[i]}
            onVisibleCellsChange={handleVisibleCellsChange}
            reelIndex={i}
            width={120}
            items={staticImageSlotItems}
            resultIndex={resultIndexes[i]}
            spinSignal={spinSignal}
            winning={winning}
            onStop={handleReelStop}
          />
        ))}
      </div>

      <SlotAnimationOverlay
        mode={overlayMode}
        onReady={handleOverlayReady}
        reelSnapshots={reelSnapshots}
        winningItemIndex={winningItemIndex}
      />

      <JackpotButtons
        onLeftGreenClick={handleLeftGreenButton}
        onRedClick={handleRedButton}
        onRightGreenClick={handleRightGreenButton}
        redDisabled={!gameBoardReady || balance < bet}
      />

      {activeWinPopUp && (
        <WinPopUp
          type={activeWinPopUp}
          onClose={() => setActiveWinPopUp(null)}
        />
      )}
      </div>
    </div>
  );
}

export default GridBoard;

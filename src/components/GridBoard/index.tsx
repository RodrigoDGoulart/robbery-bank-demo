import { useEffect, useMemo, useRef, useState } from "react";
import Fox from "../Fox";
import JackpotButtons from "../JackpotButtons";
import VerticalSlotReel from "../VerticalSlotReel";
import { staticImageSlotItems } from "../VerticalSlotReel/StaticImageSlotItems";
import { preloadSlotItemAnimations } from "../VerticalSlotReel/SlotItem/preloadSlotItemAnimations";
import { drawSlotPrize } from "../../services/slotPrizeService";
import "./GridBoard.scss";

const staticImagePath = "/static_images";

const REELS_COLUMNS = 6;
const NO_PRIZE_CHANCE_PERCENT = 0;
const BANK_RESULT_INDEX = 5;

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
  const [resultIndexes, setResultIndexes] = useState<(number | null)[]>(
    Array.from({ length: REELS_COLUMNS }, () => null),
  );
  const [winning, setWinning] = useState(false);
  const drawRequestRef = useRef(0);

  useEffect(() => {
    void preloadSlotItemAnimations();
  }, []);

  const handleLeftGreenButton = () => {
    setWinning(false);
    setResultIndexes(Array.from({ length: REELS_COLUMNS }, () => null));
    setSpinSignal((current) => current + 1);
  };

  const handleRedButton = async () => {
    const requestId = drawRequestRef.current + 1;

    drawRequestRef.current = requestId;
    setWinning(false);
    setResultIndexes(Array.from({ length: REELS_COLUMNS }, () => null));
    setSpinSignal((current) => current + 1);

    const result = await drawSlotPrize({
      noPrizeChancePercent: NO_PRIZE_CHANCE_PERCENT,
    });

    if (requestId !== drawRequestRef.current) {
      return;
    }

    if (result.hasPrize) {
      setWinning(true);
      setResultIndexes(
        Array.from({ length: REELS_COLUMNS }, () => result.prize.resultIndex),
      );
      return;
    }

    setWinning(false);
    setResultIndexes(
      getShuffledResultIndexes(staticImageSlotItems.length, REELS_COLUMNS),
    );
  };

  const handleRightGreenButton = () => {
    setWinning(true);
    setResultIndexes(Array.from({ length: REELS_COLUMNS }, () => BANK_RESULT_INDEX));
  };

  return (
    <div className="game-board-container">
      <img
        className="grid-board"
        src={`${staticImagePath}/grid-board.png`}
        alt="Jackpot grid board"
      />

      <Fox />

      <div className="reels-container">
        {Array.from({ length: REELS_COLUMNS }, (_, i) => (
          <VerticalSlotReel
            key={i}
            height={545}
            itemIndexes={reelItemOrders[i]}
            width={120}
            items={staticImageSlotItems}
            resultIndex={resultIndexes[i]}
            spinSignal={spinSignal}
            winning={winning}
          />
        ))}
      </div>

      <JackpotButtons
        onLeftGreenClick={handleLeftGreenButton}
        onRedClick={handleRedButton}
        onRightGreenClick={handleRightGreenButton}
      />
    </div>
  );
}

export default GridBoard;

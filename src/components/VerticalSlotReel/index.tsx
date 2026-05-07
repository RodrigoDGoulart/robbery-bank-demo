import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./VerticalSlotReel.scss";

export type VerticalSlotReelItem = {
  id: string;
  render: (state: { selected: boolean; winning: boolean }) => ReactNode;
  onSelect?: () => void;
};

type VerticalSlotReelProps = {
  items: VerticalSlotReelItem[];
  width: number;
  height: number;
  spinSignal: number;
  resultIndex: number | null;
  itemIndexes?: number[];
  winning?: boolean;
  className?: string;
  visibleItems?: number;
  onStop?: (index: number) => void;
};

const MIN_STOP_DURATION = 1100;
const SPIN_SPEED = 920;
const EXTRA_STOP_LOOPS = 3;
const BUFFER_ITEM_COUNT = 1;

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function normalizeItemIndexes(itemIndexes: number[] | undefined, totalItems: number) {
  const seen = new Set<number>();
  const normalized =
    itemIndexes?.filter((index) => {
      const isValid = Number.isInteger(index) && index >= 0 && index < totalItems;

      if (!isValid || seen.has(index)) {
        return false;
      }

      seen.add(index);
      return true;
    }) ?? [];

  for (let index = 0; index < totalItems; index += 1) {
    if (!seen.has(index)) {
      normalized.push(index);
    }
  }

  return normalized;
}

function clearSelection(setSelectedIndex: (index: number | null) => void) {
  requestAnimationFrame(() => setSelectedIndex(null));
}

function VerticalSlotReel({
  items,
  width,
  height,
  spinSignal,
  resultIndex,
  itemIndexes,
  winning = false,
  className = "",
  visibleItems = 5,
  onStop,
}: VerticalSlotReelProps) {
  const reelItemIndexes = useMemo(
    () => normalizeItemIndexes(itemIndexes, items.length),
    [itemIndexes, items.length],
  );
  const safeVisibleItems = Math.max(3, visibleItems | 1);
  const itemHeight = height / safeVisibleItems;
  const centerOffset = Math.floor(safeVisibleItems / 2);
  const stripHeight = itemHeight * reelItemIndexes.length;

  const [position, setPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const positionRef = useRef(0);
  const phaseRef = useRef<"idle" | "spinning" | "stopping">("idle");
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const stopRef = useRef({
    from: 0,
    to: 0,
    startTime: 0,
    duration: MIN_STOP_DURATION,
    resultIndex: 0,
  });

  const visibleCells = useMemo(() => {
    if (!items.length || !reelItemIndexes.length) {
      return [];
    }

    return Array.from({ length: safeVisibleItems + 2 }, (_, cellIndex) => {
      const rawIndex =
        Math.floor(position / itemHeight) + cellIndex - BUFFER_ITEM_COUNT;
      const reelIndex = mod(rawIndex, reelItemIndexes.length);
      const itemIndex = reelItemIndexes[reelIndex];
      const item = items[itemIndex];
      const isCenter = cellIndex === centerOffset + BUFFER_ITEM_COUNT;

      return {
        key: `${rawIndex}-${item.id}`,
        item,
        itemIndex,
        isCenter,
      };
    });
  }, [
    centerOffset,
    itemHeight,
    items,
    position,
    reelItemIndexes,
    safeVisibleItems,
  ]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!items.length || !reelItemIndexes.length) {
      return;
    }

    phaseRef.current = "spinning";
    lastTimeRef.current = null;
    clearSelection(setSelectedIndex);
  }, [items.length, reelItemIndexes.length, spinSignal]);

  useEffect(() => {
    if (!items.length || !reelItemIndexes.length || resultIndex === null) {
      return;
    }

    const normalizedResult = mod(resultIndex, items.length);
    const targetReelIndex = reelItemIndexes.indexOf(normalizedResult);

    if (targetReelIndex < 0) {
      return;
    }

    const currentPosition = positionRef.current;
    const currentCenterIndex = mod(
      Math.floor(currentPosition / itemHeight) +
        centerOffset +
        BUFFER_ITEM_COUNT,
      reelItemIndexes.length,
    );
    const deltaItems = mod(
      targetReelIndex - currentCenterIndex,
      reelItemIndexes.length,
    );
    const distance =
      (EXTRA_STOP_LOOPS * reelItemIndexes.length + deltaItems) * itemHeight;

    stopRef.current = {
      from: currentPosition,
      to: currentPosition + distance,
      startTime: performance.now(),
      duration: MIN_STOP_DURATION + Math.min(distance * 0.18, 700),
      resultIndex: normalizedResult,
    };
    phaseRef.current = "stopping";
    lastTimeRef.current = null;
    clearSelection(setSelectedIndex);
  }, [
    centerOffset,
    itemHeight,
    items.length,
    reelItemIndexes,
    resultIndex,
  ]);

  useEffect(() => {
    if (!items.length || !reelItemIndexes.length) {
      return undefined;
    }

    const tick = (time: number) => {
      const phase = phaseRef.current;

      if (phase === "spinning") {
        const lastTime = lastTimeRef.current ?? time;
        const delta = (time - lastTime) / 1000;
        const nextPosition = positionRef.current + delta * SPIN_SPEED;

        lastTimeRef.current = time;
        positionRef.current = nextPosition;
        setPosition(nextPosition);
      }

      if (phase === "stopping") {
        const stop = stopRef.current;
        const progress = Math.min((time - stop.startTime) / stop.duration, 1);
        const nextPosition =
          stop.from + (stop.to - stop.from) * easeOutCubic(progress);

        positionRef.current = nextPosition;
        setPosition(nextPosition);

        if (progress >= 1) {
          const snappedPosition =
            Math.round(stop.to / itemHeight) * itemHeight;

          positionRef.current = snappedPosition;
          setPosition(snappedPosition);
          setSelectedIndex(stop.resultIndex);
          phaseRef.current = "idle";
          items[stop.resultIndex]?.onSelect?.();
          onStop?.(stop.resultIndex);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [itemHeight, items, onStop, reelItemIndexes.length]);

  if (!items.length || !reelItemIndexes.length) {
    return null;
  }

  const translateY = -(position % stripHeight) % itemHeight;

  return (
    <div
      className={`vertical-slot-reel ${className}`.trim()}
      style={{ width, height }}
    >
      <div className="vertical-slot-reel__selection" />
      <div
        className="vertical-slot-reel__strip"
        style={{
          height: itemHeight * visibleCells.length,
          transform: `translateY(${translateY - itemHeight}px)`,
        }}
      >
        {visibleCells.map(({ key, item, itemIndex, isCenter }) => (
          <div
            className="vertical-slot-reel__cell"
            key={key}
            style={{ height: itemHeight }}
          >
            {item.render({
              selected: selectedIndex === itemIndex && isCenter,
              winning: winning && selectedIndex === itemIndex && isCenter,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerticalSlotReel;

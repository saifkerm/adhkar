import { useCallback, useState } from "react";
import { PrayerTime } from "@/data/invocations";
import { useSwipe } from "@/hooks/useSwipe";

/**
 * Gère la navigation circulaire entre différentes prières.
 */
export function usePrayerNavigation(prayers: readonly PrayerTime[]) {
  const [active, setActive] = useState(prayers[0]);

  const idxOf = useCallback(
    (label: PrayerTime) => prayers.findIndex((p) => p === label),
    [prayers]
  );

  const nextPrayer = useCallback(
    () => prayers[(idxOf(active) + 1) % prayers.length],
    [active, idxOf, prayers]
  );
  const prevPrayer = useCallback(
    () => prayers[(idxOf(active) - 1 + prayers.length) % prayers.length],
    [active, idxOf, prayers]
  );

  const swipeRef = useSwipe({
    onSwipeLeft: () => setActive(nextPrayer()),
    onSwipeRight: () => setActive(prevPrayer()),
  });

  return { active, setActive, nextPrayer, prevPrayer, swipeRef } as const;
}

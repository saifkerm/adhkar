import { useMemo } from "react";
import type { Invocation, DhikrMoment, PrayerTime } from "@/data/invocations";
import type { State } from "@/hooks/useDailyState";
import { getTripleGoals } from "@/utils/tripleGoals";
import { makeKey } from "@/utils/key";

/**
 * Calcule la progression globale (done/total/pct) pour une liste d’invocations.
 */
export function useProgress(
  invocations: Invocation[],
  state: State,
  moment?: DhikrMoment | PrayerTime
) {
  return useMemo(() => {
    let done = 0;
    let total = 0;

    for (const inv of invocations) {
      if (inv.type === "triple") {
        const goals = getTripleGoals(inv, moment);
        const key =
          inv.momentGoals && moment && inv.momentGoals[moment]
            ? makeKey(inv.id, moment)
            : inv.id;
        const sub = (state.counts[key] as any)?.sub || {};
        const goalTotal = Object.values(goals).reduce((a, n) => a + n, 0);
        const current = Object.keys(goals).reduce(
          (a, k) => a + (sub[k] ?? 0),
          0
        );
        done += Math.min(current, goalTotal);
        total += goalTotal;
      } else if (typeof inv.goal === "number") {
        const val = (state.counts[inv.id] as number) ?? 0;
        done += Math.min(val, inv.goal);
        total += inv.goal;
      }
    }

    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [invocations, state, moment]);
}

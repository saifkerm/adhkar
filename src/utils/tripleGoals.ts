import type { Invocation } from "@/data/invocations";
import { PrayerTime, DhikrMoment } from "@/data/invocations";

export function getTripleGoals(
  inv: Extract<Invocation, { type: "triple" }>,
  moment?: PrayerTime | DhikrMoment
) {
  const base: Record<string, number> = Object.fromEntries(
    inv.parts.map((p) => [p.key, p.goal])
  );
  if (moment && inv.momentGoals && inv.momentGoals[moment]) {
    return { ...base, ...inv.momentGoals[moment] };
  }
  return base;
}

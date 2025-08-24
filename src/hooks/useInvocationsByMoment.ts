import { useMemo } from "react";
import type { Invocation, DhikrMoment, PrayerTime } from "@/data/invocations";

/**
 * Retourne les invocations correspondant à un moment donné (matin, soir, etc.).
 */
export function useInvocationsByMoment(
  allInvocations: Invocation[],
  moment: DhikrMoment | PrayerTime
) {
  return useMemo(
    () => allInvocations.filter((inv) => inv.moments.includes(moment)),
    [allInvocations, moment]
  );
}

// src/hooks/useInvocationState.ts
import { useCallback } from "react";
import type { Invocation } from "@/data/invocations";
import { useDailyState } from "@/hooks/useDailyState";

/**
 * Encapsule `useDailyState` et fournit des helpers pour mettre à jour les décomptes.
 */
export function useInvocationState(invocations: Invocation[]) {
  const { state, setState, resetGlobal } = useDailyState(invocations);

  const setSingle = useCallback(
    (key: string, value: number) => {
      setState((s) => ({
        ...s,
        counts: { ...s.counts, [key]: value },
      }));
    },
    [setState]
  );

  const setTriple = useCallback(
    (key: string, sub: Record<string, number>) => {
      setState((s) => ({
        ...s,
        counts: { ...s.counts, [key]: { sub } },
      }));
    },
    [setState]
  );

  return { state, resetGlobal, setSingle, setTriple } as const;
}

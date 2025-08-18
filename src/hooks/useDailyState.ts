import { useEffect, useMemo, useRef, useState } from "react";
import type { Invocation } from "@/data/invocations";

type Counts =
  | number
  | {
      sub: Record<string, number>;
    };

type State = {
  date: string;
  counts: Record<string, Counts>;
};

const STORAGE_KEY = "adhkar.v1";
const todayKey = () => new Date().toISOString().slice(0, 10);

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

export const makeKey = (id: string, moment?: string) =>
  moment ? `${id}::${slug(moment)}` : id;

export function defaultState(invocations: Invocation[]): State {
  const base: State = { date: todayKey(), counts: {} };
  for (const inv of invocations) {
    if (inv.type === "triple") {
      if (inv.momentGoals) {
        for (const m of Object.keys(inv.momentGoals)) {
          const key = makeKey(inv.id, m);
          const sub: Record<string, number> = {};
          for (const p of inv.parts) sub[p.key] = 0;
          base.counts[key] = { sub };
        }
      } else {
        const sub: Record<string, number> = {};
        for (const p of inv.parts) sub[p.key] = 0;
        base.counts[inv.id] = { sub };
      }
    } else {
      base.counts[inv.id] = 0;
    }
  }
  return base;
}

export function useDailyState(invocations: Invocation[]) {
  const fresh = useMemo(() => defaultState(invocations), [invocations]);
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fresh;
      const parsed = JSON.parse(raw) as State;
      if (parsed.date !== todayKey()) return fresh;
      const st: State = { date: todayKey(), counts: {} };
      for (const inv of invocations) {
        if (inv.type === "triple") {
          if (inv.momentGoals) {
            for (const m of Object.keys(inv.momentGoals)) {
              const key = makeKey(inv.id, m);
              const baseSub: Record<string, number> = {};
              for (const p of inv.parts) baseSub[p.key] = 0;
              const saved = (parsed.counts?.[key] as any) || {};
              st.counts[key] = { sub: { ...baseSub, ...(saved.sub || {}) } };
            }
          } else {
            const baseSub: Record<string, number> = {};
            for (const p of inv.parts) baseSub[p.key] = 0;
            const saved = (parsed.counts?.[inv.id] as any) || {};
            st.counts[inv.id] = { sub: { ...baseSub, ...(saved.sub || {}) } };
          }
        } else {
          const v = Number(parsed.counts?.[inv.id] ?? 0);
          st.counts[inv.id] = Math.max(0, v);
        }
      }
      return st;
    } catch {
      return fresh;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    const msUntilNextMidnight = () => {
      const n = new Date();
      const t = new Date(n);
      t.setHours(24, 0, 0, 0);
      return Math.max(0, +t - +n);
    };
    const schedule = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setState(defaultState(invocations));
        schedule();
      }, msUntilNextMidnight() + 1000);
    };
    schedule();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [invocations]);

  const resetGlobal = () => setState(defaultState(invocations));

  return { state, setState, resetGlobal };
}

export type { State };

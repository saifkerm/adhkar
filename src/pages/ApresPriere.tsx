import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { TripleInvocationCard } from "@/components/TripleInvocationCard";
import {
  DhikrMoment,
  INVOCATIONS,
  PRAYERS,
  PrayerTime,
  SECTION_CONFIGURATIONS,
} from "@/data/invocations";
import { useDailyState } from "@/hooks/useDailyState";
import { currentPrayerLabel } from "@/utils/currentPrayer";
import { getTripleGoals, makeKey } from "@/utils/tripleGoals";

import { HeaderPrayers } from "@/components/HeaderPrayers";
import InvocationCard from "@/components/InvocationCard";
import { useSwipe } from "@/hooks/useSwipe";

export default function ApresPriere() {
  const { state, setState, resetGlobal } = useDailyState(INVOCATIONS);
  const [activePrayer, setActivePrayer] = useState<PrayerTime>(
    currentPrayerLabel()
  );

  const setSingle = (key: string, val: number) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: val } }));
  };

  const setTriple = (key: string, sub: Record<string, number>) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: { sub } } }));
  };

  const renderGrid = (ids: string[], context?: PrayerTime | DhikrMoment) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
      {ids.map((id) => {
        const inv = INVOCATIONS.find((v) => v.id === id);
        if (!inv) return null;
        
        if (inv.type === "triple") {
          const goals = getTripleGoals(inv, context);
          const key =
            inv.momentGoals && context && inv.momentGoals[context as any]
              ? makeKey(id, context)
              : id;
          const sub = (state.counts[key] as any)?.sub || {};
          return (
            <TripleInvocationCard
              key={key}
              inv={inv}
              sub={sub}
              goals={goals}
              setSub={(next) => setTriple(key, next)}
            />
          );
        }
        
        const key = id;
        const value = (state.counts[key] as number) ?? 0;
        return (
          <InvocationCard
            key={key}
            inv={inv}
            value={value}
            setValue={(v) => setSingle(id, v)}
            player={{
              audioPath: inv?.audio as string ?? "",
              vttPath: inv?.vtt as string ?? "",
              words: inv.words as any ?? [],
              translation: inv.translation,
            }}
          />
        );
      })}
    </div>
  );

  const visibleItemsForOverall = useMemo(() => {
    const section = activePrayer;
    const ids = SECTION_CONFIGURATIONS[section] || [];
    const pairs: Array<{ key: string; goalTotal: number; current: number }> = [];

    for (const id of ids) {
      const inv = INVOCATIONS.find((v) => v.id === id)!;
      if (inv.type === "triple") {
        const goals = getTripleGoals(inv, section);
        const key =
          inv.momentGoals && inv.momentGoals[section]
            ? makeKey(id, section)
            : id;
        const sub = (state.counts[key] as any)?.sub || {};
        const goalTotal = Object.values(goals).reduce((a, n) => a + n, 0);
        const current = Object.keys(goals).reduce(
          (a, k) => a + (sub[k] ?? 0),
          0
        );
        pairs.push({ key, goalTotal, current });
      } else if (typeof (inv as any).goal === "number") {
        const key = id;
        const goalTotal = (inv as any).goal as number;
        const current = (state.counts[key] as number) ?? 0;
        pairs.push({ key, goalTotal, current });
      }
    }

    let done = 0, total = 0;
    for (const p of pairs) {
      done += Math.min(p.current, p.goalTotal);
      total += p.goalTotal;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [state, activePrayer]);

  const computePctForPrayer = (section: PrayerTime) => {
    const ids = SECTION_CONFIGURATIONS[section] || [];
    let done = 0, total = 0;
    
    for (const id of ids) {
      const inv = INVOCATIONS.find((v) => v.id === id)!;
      if (inv.type === "triple") {
        const goals = getTripleGoals(inv, section);
        const key =
          inv.momentGoals && inv.momentGoals[section]
            ? makeKey(inv.id, section)
            : inv.id;
        const sub = (state.counts[key] as any)?.sub || {};
        const goalTotal = Object.values(goals).reduce((a, n) => a + n, 0);
        const currentV = Object.keys(goals).reduce(
          (a, k) => a + (sub[k] ?? 0),
          0
        );
        done += Math.min(currentV, goalTotal);
        total += goalTotal;
      } else if (typeof (inv as any).goal === "number") {
        const key = inv.id;
        const goal = (inv as any).goal as number;
        const currentV = (state.counts[key] as number) ?? 0;
        done += Math.min(currentV, goal);
        total += goal;
      }
    }
    return total ? Math.round((done / total) * 100) : 0;
  };

  const idxOf = (label: PrayerTime) => PRAYERS.findIndex((p) => p === label);
  const nextPrayer = () => PRAYERS[(idxOf(activePrayer) + 1) % PRAYERS.length];
  const prevPrayer = () =>
    PRAYERS[(idxOf(activePrayer) - 1 + PRAYERS.length) % PRAYERS.length];

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => setActivePrayer(nextPrayer()),
    onSwipeRight: () => setActivePrayer(prevPrayer()),
  });

  return (
    <main className="min-h-dvh bg-background text-foreground sa-pb">
      <header className="sa-pt sticky top-0 z-20 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="sa-px mx-auto flex max-w-screen-md flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[20px] font-extrabold">Après la prière</h1>
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="h-9 rounded-lg px-3 whitespace-nowrap"
              onClick={resetGlobal}
            >
              <span className="inline sm:hidden">Réinit.</span>
              <span className="hidden sm:inline">Réinit. global</span>
            </Button>
          </div>
        </div>

        <HeaderPrayers
          active={activePrayer}
          onChange={(p) => setActivePrayer(p)}
          getPct={(p) => computePctForPrayer(p)}
        />
      </header>

      <section className="mx-auto mt-2 max-w-screen-md px-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="w-fit rounded-full border px-2.5 py-1 text-[12px] text-muted-foreground">
            Progression
          </span>
          <div className="sm:flex-1">
            <Progress value={visibleItemsForOverall.pct} className="h-3" />
          </div>
          <span className="w-fit rounded-full border px-2.5 py-1 text-[12px] font-bold">
            {visibleItemsForOverall.pct}%
          </span>
        </div>
      </section>

      <section
        ref={swipeRef}
        className="mx-auto mt-4 max-w-screen-md px-3 pb-8"
      >
        {renderGrid(
          SECTION_CONFIGURATIONS[activePrayer] || [],
          activePrayer
        )}
      </section>
    </main>
  );
}
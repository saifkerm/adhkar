import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { TripleInvocationCard } from "@/components/TripleInvocationCard";
import { DhikrMoment, INVOCATIONS } from "@/data/invocations";
import { useDailyState } from "@/hooks/useDailyState";
import { getTripleGoals } from "@/utils/tripleGoals";

import InvocationCard from "@/components/InvocationCard";
import { makeKey } from "@/utils/key";

export default function Matin() {
  const { state, setState, resetGlobal } = useDailyState(INVOCATIONS);

  // Filtrer les invocations pour le matin
  const matinInvocations = useMemo(
    () =>
      INVOCATIONS.filter((inv) => inv.moments.includes(DhikrMoment.MORNING)),
    []
  );

  const setSingle = (key: string, val: number) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: val } }));
  };

  const setTriple = (key: string, sub: Record<string, number>) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: { sub } } }));
  };

  const renderGrid = (invs: typeof INVOCATIONS) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
      {invs.map((inv) => {
        if (inv.type === "triple") {
          const goals = getTripleGoals(inv, DhikrMoment.MORNING);
          const key =
            inv.momentGoals && inv.momentGoals[DhikrMoment.MORNING]
              ? makeKey(inv.id, DhikrMoment.MORNING)
              : inv.id;
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

        const key = inv.id;
        const value = (state.counts[key] as number) ?? 0;
        return (
          <InvocationCard
            key={key}
            inv={inv}
            value={value}
            setValue={(v) => setSingle(inv.id, v)}
            player={{
              audioPath: (inv?.audio as string) ?? "",
              vttPath: (inv?.vtt as string) ?? "",
              words: (inv.words as any) ?? [],
              translation: inv.translation,
            }}
          />
        );
      })}
    </div>
  );

  const visibleItemsForOverall = useMemo(() => {
    const pairs: Array<{ key: string; goalTotal: number; current: number }> =
      [];

    for (const inv of matinInvocations) {
      if (inv.type === "triple") {
        const goals = getTripleGoals(inv, DhikrMoment.MORNING);
        const key =
          inv.momentGoals && inv.momentGoals[DhikrMoment.MORNING]
            ? makeKey(inv.id, DhikrMoment.MORNING)
            : inv.id;
        const sub = (state.counts[key] as any)?.sub || {};
        const goalTotal = Object.values(goals).reduce((a, n) => a + n, 0);
        const current = Object.keys(goals).reduce(
          (a, k) => a + (sub[k] ?? 0),
          0
        );
        pairs.push({ key, goalTotal, current });
      } else if (typeof inv.goal === "number") {
        const key = inv.id;
        const goalTotal = inv.goal as number;
        const current = (state.counts[key] as number) ?? 0;
        pairs.push({ key, goalTotal, current });
      }
    }

    let done = 0,
      total = 0;
    for (const p of pairs) {
      done += Math.min(p.current, p.goalTotal);
      total += p.goalTotal;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [state, matinInvocations]);

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
          <h1 className="text-[20px] font-extrabold">Matin</h1>

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

      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
        {renderGrid(matinInvocations)}
      </section>
    </main>
  );
}

import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INVOCATIONS, PRAYERS, SECTION_ORDER } from "@/data/invocations";
import { useDailyState } from "@/hooks/useDailyState";
import { InvocationCard } from "@/components/InvocationCard";
import { TripleInvocationCard } from "@/components/TripleInvocationCard";
import { currentPrayerLabel } from "@/utils/currentPrayer";
import { getTripleGoals, makeKey } from "@/utils/tripleGoals";

type TabKey = "apres" | "matin" | "soir" | "journee" | "sommeil" | "tout";

export default function App() {
  const { state, setState, resetGlobal } = useDailyState(INVOCATIONS);
  const [tab, setTab] = useState<TabKey>("apres");

  const setSingle = (key: string, val: number) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: val } }));
  };
  const setTriple = (key: string, sub: Record<string, number>) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [key]: { sub } } }));
  };

  const renderGrid = (ids: string[], contextLabel?: string) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ids.map((id) => {
        const inv = INVOCATIONS.find((v) => v.id === id);
        if (!inv) return null;
        if (inv.type === "triple") {
          const goals = getTripleGoals(inv, contextLabel);
          const key =
            inv.momentGoals && contextLabel && inv.momentGoals[contextLabel]
              ? makeKey(id, contextLabel)
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
          />
        );
      })}
    </div>
  );

  const filterByMoment = (label: string) =>
    INVOCATIONS.filter((v) => v.moment?.includes(label)).map((v) => v.id);

  const visibleItemsForOverall = useMemo(() => {
    let pairs: Array<{ key: string; goalTotal: number; current: number }> = [];

    if (tab === "apres") {
      for (const section of PRAYERS) {
        const ids = SECTION_ORDER[section] || [];
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
      }
    } else {
      const label =
        tab === "matin"
          ? "Matin"
          : tab === "soir"
          ? "Soir"
          : tab === "journee"
          ? "Toute la journée"
          : tab === "sommeil"
          ? "Avant de dormir"
          : null;

      const ids =
        tab === "tout"
          ? INVOCATIONS.map((v) => v.id)
          : label
          ? filterByMoment(label)
          : [];
      for (const id of ids) {
        const inv = INVOCATIONS.find((v) => v.id === id)!;
        if (inv.type === "triple") {
          const goals = getTripleGoals(inv, label ?? undefined);
          const key =
            inv.momentGoals && label && inv.momentGoals[label]
              ? makeKey(id, label)
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
    }

    let done = 0,
      total = 0;
    for (const p of pairs) {
      done += Math.min(p.current, p.goalTotal);
      total += p.goalTotal;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [state, tab]);

  const current = currentPrayerLabel();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(
    Object.fromEntries(PRAYERS.map((p) => [p, p === current]))
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <h1 className="text-xl font-extrabold">Adhkâr</h1>
          <div className="ml-auto">
            <Button variant="destructive" onClick={resetGlobal}>
              Réinit. global
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-5xl">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabKey)}
            className="w-full"
          >
            <TabsList className="flex w-full flex-wrap gap-2">
              <TabsTrigger value="apres">Après la prière</TabsTrigger>
              <TabsTrigger value="matin">Matin</TabsTrigger>
              <TabsTrigger value="soir">Soir</TabsTrigger>
              <TabsTrigger value="journee">Toute la journée</TabsTrigger>
              <TabsTrigger value="sommeil">Avant de dormir</TabsTrigger>
              <TabsTrigger value="tout">Tout</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <section className="mx-auto mt-3 max-w-3xl px-4 md:px-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Progression
          </span>
          <div className="flex-1">
            <Progress value={visibleItemsForOverall.pct} className="h-2" />
          </div>
          <span className="rounded-full border px-3 py-1 text-xs font-bold">
            {visibleItemsForOverall.pct}%
          </span>
        </div>
      </section>

      <section className="mx-auto mt-2 max-w-5xl px-4 pb-10 md:px-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full"
        >
          <TabsContent value="apres" className="mt-2 space-y-2">
            {PRAYERS.map((section) => {
              const ids = SECTION_ORDER[section] || [];
              if (!ids.length) return null;
              const open = !!openMap[section];
              return (
                <details
                  key={section}
                  open={open}
                  onToggle={(e) => {
                    const isOpen = (e.target as HTMLDetailsElement).open;
                    setOpenMap((m) => ({ ...m, [section]: isOpen }));
                  }}
                  className="group border-b pb-2 pt-1"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
                    {section}
                    <span className="ml-auto text-xs text-primary group-open:hidden">
                      Afficher
                    </span>
                    <span className="ml-auto hidden text-xs text-primary group-open:inline">
                      Masquer
                    </span>
                  </summary>
                  <div className="mt-2">{renderGrid(ids, section)}</div>
                </details>
              );
            })}
          </TabsContent>

          <TabsContent value="matin" className="mt-4">
            {renderGrid(filterByMoment("Matin"))}
          </TabsContent>
          <TabsContent value="soir" className="mt-4">
            {renderGrid(filterByMoment("Soir"))}
          </TabsContent>
          <TabsContent value="journee" className="mt-4">
            {renderGrid(filterByMoment("Toute la journée"))}
          </TabsContent>
          <TabsContent value="sommeil" className="mt-4">
            {renderGrid(filterByMoment("Avant de dormir"))}
          </TabsContent>
          <TabsContent value="tout" className="mt-4">
            {renderGrid(INVOCATIONS.map((v) => v.id))}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

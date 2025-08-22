import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";

import {
  INVOCATIONS,
  PRAYERS,
  SECTION_CONFIGURATIONS,
  PrayerTime,
  DhikrMoment,
} from "@/data/invocations";
import { useDailyState } from "@/hooks/useDailyState";
import { InvocationCard } from "@/components/InvocationCard";
import { TripleInvocationCard } from "@/components/TripleInvocationCard";
import { currentPrayerLabel } from "@/utils/currentPrayer";
import { getTripleGoals, makeKey } from "@/utils/tripleGoals";

import { Menu } from "lucide-react";
import { HeaderPrayers } from "@/components/HeaderPrayers";
import { BottomMenu } from "@/components/BottomMenu";
import { useSwipe } from "@/hooks/useSwipe";

type TabKey = "apres" | "matin" | "soir" | "journee" | "sommeil" | "tout";

export default function App() {
  const { state, setState, resetGlobal } = useDailyState(INVOCATIONS);
  const [tab, setTab] = useState<TabKey>("apres");

  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            inv={inv as any}
            value={value}
            setValue={(v) => setSingle(id, v)}
          />
        );
      })}
    </div>
  );

  const filterByMoment = (m: DhikrMoment) =>
    INVOCATIONS.filter((v) => v.moments?.includes(m)).map((v) => v.id);

  const visibleItemsForOverall = useMemo(() => {
    let pairs: Array<{ key: string; goalTotal: number; current: number }> = [];

    if (tab === "apres") {
      const section = activePrayer;
      const ids = SECTION_CONFIGURATIONS[section] || [];
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
    } else {
      const label: DhikrMoment | null =
        tab === "matin"
          ? DhikrMoment.MORNING
          : tab === "soir"
          ? DhikrMoment.EVENING
          : tab === "journee"
          ? DhikrMoment.ALL_DAY
          : tab === "sommeil"
          ? DhikrMoment.BEFORE_SLEEP
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
  }, [state, tab, activePrayer]);

  const computePctForPrayer = (section: PrayerTime) => {
    const ids = SECTION_CONFIGURATIONS[section] || [];
    let done = 0,
      total = 0;
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

  const gotoPrayer = (label: PrayerTime) => {
    setTab("apres");
    setActivePrayer(label);
  };

  const idxOf = (label: PrayerTime) => PRAYERS.findIndex((p) => p === label);
  const nextPrayer = () => PRAYERS[(idxOf(activePrayer) + 1) % PRAYERS.length];
  const prevPrayer = () =>
    PRAYERS[(idxOf(activePrayer) - 1 + PRAYERS.length) % PRAYERS.length];

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => gotoPrayer(nextPrayer()),
    onSwipeRight: () => gotoPrayer(prevPrayer()),
  });

  return (
    <main className="min-h-dvh bg-background text-foreground sa-pb">
      <header className="sa-pt sticky top-0 z-20 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="sa-px mx-auto flex max-w-screen-md flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <h1 className="text-[20px] font-extrabold">Adhkâr</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
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
          onChange={(p) => gotoPrayer(p)}
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
        className="mx-auto mt-2 max-w-screen-md px-3 pb-8"
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full"
        >
          <TabsContent value="apres" className="mt-2">
            {renderGrid(
              SECTION_CONFIGURATIONS[activePrayer] || [],
              activePrayer
            )}
          </TabsContent>

          <TabsContent value="matin" className="mt-3">
            {renderGrid(
              filterByMoment(DhikrMoment.MORNING),
              DhikrMoment.MORNING
            )}
          </TabsContent>

          <TabsContent value="soir" className="mt-3">
            {renderGrid(
              filterByMoment(DhikrMoment.EVENING),
              DhikrMoment.EVENING
            )}
          </TabsContent>

          <TabsContent value="journee" className="mt-3">
            {renderGrid(
              filterByMoment(DhikrMoment.ALL_DAY),
              DhikrMoment.ALL_DAY
            )}
          </TabsContent>

          <TabsContent value="sommeil" className="mt-3">
            {renderGrid(
              filterByMoment(DhikrMoment.BEFORE_SLEEP),
              DhikrMoment.BEFORE_SLEEP
            )}
          </TabsContent>

          <TabsContent value="tout" className="mt-3">
            {renderGrid(INVOCATIONS.map((v) => v.id))}
          </TabsContent>
        </Tabs>
      </section>

      <BottomMenu
        open={menuOpen}
        value={tab}
        onClose={() => setMenuOpen(false)}
        onSelect={(v) => setTab(v)}
      />
    </main>
  );
}

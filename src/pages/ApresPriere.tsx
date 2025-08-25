import {
  INVOCATIONS,
  PRAYERS,
  PrayerTime,
  SECTION_CONFIGURATIONS,
} from "@/data/invocations";
import { getTripleGoals } from "@/utils/tripleGoals";
import { useMemo, useState } from "react";

import { HeaderPrayers } from "@/components/HeaderPrayers";
import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";
import { makeKey } from "@/utils/key";

export default function ApresPriere() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

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

  const [activePrayer, setActivePrayer] = useState<PrayerTime>(PRAYERS[0]);

  const currentInvocations = useMemo(() => {
    const ids = SECTION_CONFIGURATIONS[activePrayer] || [];
    return ids
      .map((id) => INVOCATIONS.find((inv) => inv.id === id))
      .filter((inv): inv is NonNullable<typeof inv> => Boolean(inv));
  }, [activePrayer]);

  const { pct } = useProgress(currentInvocations, state, activePrayer);

  return (
    <DhikrPageLayout
      title="Après la prière"
      progressPct={pct}
      resetGlobal={resetGlobal}
      headerExtra={
        <HeaderPrayers
          active={activePrayer}
          onChange={(p) => setActivePrayer(p)}
          getPct={(p) => computePctForPrayer(p)}
        />
      }
    >
      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
        {
          <InvocationGrid
            invocations={currentInvocations}
            moment={activePrayer}
            state={state}
            setSingle={setSingle}
            setTriple={setTriple}
          />
        }
      </section>
    </DhikrPageLayout>
  );
}

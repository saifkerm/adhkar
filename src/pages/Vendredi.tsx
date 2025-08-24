import { useMemo } from "react";

import { DhikrMoment, INVOCATIONS } from "@/data/invocations";

import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";

export default function Vendredi() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

  // Filtrer les invocations pour le vendredi
  const vendrediInvocations = useMemo(
    () =>
      INVOCATIONS.filter((inv) =>
        inv.moments.includes(DhikrMoment.FRIDAY_RECOMMENDED)
      ),
    []
  );


  const { pct } = useProgress(vendrediInvocations, state, DhikrMoment.FRIDAY_RECOMMENDED);

  return (
    <DhikrPageLayout
      title="Vendredi"
      progressPct={pct}
      resetGlobal={resetGlobal}
    >
    <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
      {
        <InvocationGrid
          invocations={vendrediInvocations}
          state={state}
          setSingle={setSingle}
          setTriple={setTriple}
        />
      }
    </section>
    </DhikrPageLayout>
   
  );
}

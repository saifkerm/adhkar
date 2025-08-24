
import { DhikrMoment, INVOCATIONS } from "@/data/invocations";

import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useInvocationsByMoment } from "@/hooks/useInvocationsByMoment";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";

export default function Soir() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

  // Filtrer les invocations pour le soir
  const soirInvocations = useInvocationsByMoment(
    INVOCATIONS,
    DhikrMoment.EVENING
  );
  const { pct } = useProgress(soirInvocations, state, DhikrMoment.MORNING);

 

  return (
    <DhikrPageLayout
      title="Soir"
      progressPct={pct}
      resetGlobal={resetGlobal}
    >
      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
      {
          <InvocationGrid
            invocations={soirInvocations}
            state={state}
            setSingle={setSingle}
            setTriple={setTriple}
          />
        }
      </section>
    </DhikrPageLayout>
  );
}

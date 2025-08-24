import { DhikrMoment, INVOCATIONS } from "@/data/invocations";

import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useInvocationsByMoment } from "@/hooks/useInvocationsByMoment";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";

export default function AvantDeDormir() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

  // Filtrer les invocations pour avant de dormir
  const sommeilInvocations = useInvocationsByMoment(
    INVOCATIONS,
    DhikrMoment.BEFORE_SLEEP
  );
  const { pct } = useProgress(
    sommeilInvocations,
    state,
    DhikrMoment.BEFORE_SLEEP
  );

  return (
    <DhikrPageLayout
      title="Avant de dormir"
      progressPct={pct}
      resetGlobal={resetGlobal}
    >
      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
        {
          <InvocationGrid
            invocations={sommeilInvocations}
            state={state}
            setSingle={setSingle}
            setTriple={setTriple}
          />
        }
      </section>
    </DhikrPageLayout>
  );
}

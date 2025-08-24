
import { DhikrMoment, INVOCATIONS } from "@/data/invocations";

import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useInvocationsByMoment } from "@/hooks/useInvocationsByMoment";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";

export default function Matin() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

  const matinInvocations = useInvocationsByMoment(
    INVOCATIONS,
    DhikrMoment.MORNING
  );
  const { pct } = useProgress(matinInvocations, state, DhikrMoment.MORNING);

  return (
    <DhikrPageLayout
      title="Matin"
      progressPct={pct}
      resetGlobal={resetGlobal}
    >
      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
        {
          <InvocationGrid
            invocations={matinInvocations}
            state={state}
            setSingle={setSingle}
            setTriple={setTriple}
          />
        }
      </section>
    </DhikrPageLayout>
  );
}

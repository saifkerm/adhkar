
import { DhikrMoment, INVOCATIONS } from "@/data/invocations";

import { InvocationGrid } from "@/components/InvocationGrid";
import { useInvocationState } from "@/hooks/useInvocationState";
import { useInvocationsByMoment } from "@/hooks/useInvocationsByMoment";
import { useProgress } from "@/hooks/useProgress";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";

export default function TouteLaJournee() {
  const { state, setSingle, setTriple, resetGlobal } =
    useInvocationState(INVOCATIONS);

  // Filtrer les invocations pour toute la journée
  const journeeInvocations = useInvocationsByMoment(
    INVOCATIONS,
    DhikrMoment.ALL_DAY
  );
  const { pct } = useProgress(journeeInvocations, state, DhikrMoment.ALL_DAY);

  return (
    <DhikrPageLayout
      title="Toute la journée"
      progressPct={pct}
      resetGlobal={resetGlobal}
    >
      <section className="mx-auto mt-4 max-w-screen-md px-3 pb-8">
        {
          <InvocationGrid
            invocations={journeeInvocations}
            state={state}
            setSingle={setSingle}
            setTriple={setTriple}
          />
        }
      </section>
    </DhikrPageLayout>
  );
}

import type { FC } from "react";
import type { Invocation, DhikrMoment, PrayerTime } from "@/data/invocations";
import { getTripleGoals } from "@/utils/tripleGoals";
import { makeKey } from "@/utils/key";
import InvocationCard from "@/components/InvocationCard";
import { TripleInvocationCard } from "@/components/TripleInvocationCard";
import type { State } from "@/hooks/useDailyState";

interface Props {
  invocations: Invocation[];
  moment?: DhikrMoment | PrayerTime;
  state: State;
  setSingle: (key: string, value: number) => void;
  setTriple: (key: string, sub: Record<string, number>) => void;
}

/**
 * Rendu des cartes d’invocations (simples ou triples) pour un moment donné.
 * Centralise la logique présente jusqu’ici dans chaque page.
 */
export const InvocationGrid: FC<Props> = ({
  invocations,
  moment,
  state,
  setSingle,
  setTriple,
}) => {
  return (
    <>
      {invocations.map((inv) => {
        if (inv.type === "triple") {
          const goals = getTripleGoals(inv, moment);
          const key =
            inv.momentGoals && moment && inv.momentGoals[moment]
              ? makeKey(inv.id, moment)
              : inv.id;
          const sub = (state.counts[key] as any)?.sub || {};
          return (
            <TripleInvocationCard
              key={key}
              inv={inv}
              sub={sub}
              setSub={(next) => setTriple(key, next)}
              goals={goals}
            />
          );
        }

        const val = (state.counts[inv.id] as number) ?? 0;
        return (
          <InvocationCard
            key={inv.id}
            inv={inv as any} // le composant attend un type "simple"
            value={val}
            setValue={(next) => setSingle(inv.id, next)}
            player={{
              audioPath: inv.audio ?? "",
              vttPath: inv.vtt ?? "",
              words: (inv.words as any) ?? [],
              translation: inv.translation,
            }}
          />
        );
      })}
    </>
  );
};

import type { Invocation } from "@/data/invocations";

export const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

export const makeKey = (id: string, moment?: string) =>
  moment ? `${id}::${slug(moment)}` : id;

export function getTripleGoals(
  inv: Extract<Invocation, { type: "triple" }>,
  moment?: string
) {
  const base: Record<string, number> = Object.fromEntries(
    inv.parts.map((p) => [p.key, p.goal])
  );
  if (moment && inv.momentGoals && inv.momentGoals[moment]) {
    return { ...base, ...inv.momentGoals[moment] };
  }
  return base;
}

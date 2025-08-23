import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Invocation } from "@/data/invocations";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { TranslationToggle } from "./TranslationToggle";

type Triple = Extract<Invocation, { type: "triple" }>;
type Counts = { [k: string]: number };

type Props = {
  inv: Triple;
  sub: Counts;
  setSub: (next: Counts) => void;
  goals: Record<string, number>;
};

export function TripleInvocationCard({ inv, sub, setSub, goals }: Props) {
  const [open, setOpen] = useState(false);

  const goalTotal = inv.parts.reduce((a, p) => a + (goals[p.key] ?? p.goal), 0);
  const current = inv.parts.reduce((a, p) => a + (sub[p.key] ?? 0), 0);
  const pct = Math.min(100, Math.round((current / goalTotal) * 100));

  const update = (k: string, v: number, limit: number) => {
    const next = { ...sub, [k]: Math.max(0, Math.min(limit, v)) };
    setSub(next);
    try {
      (navigator as any).vibrate?.(8);
    } catch {}
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="group flex flex-1 items-center gap-2 text-left"
          >
            <CardTitle className="text-base font-extrabold">
              {inv.title}
            </CardTitle>
            <span className="ml-auto rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums">
              {current} / {goalTotal}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4 text-center text-2xl font-extrabold">
            {inv.transcription}
          </div>

          <TranslationToggle text={inv.translation} />

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Ablutions: {inv.requiresWudu ? "requises" : "non requises"}
            </span>
            {inv.source.url ? (
              <a
                href={inv.source.url}
                target="_blank"
                className="rounded-full border px-3 py-1 text-xs text-primary underline"
              >
                Source: {inv.source.reference}
              </a>
            ) : (
              <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                Source: {inv.source.reference}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            {inv.parts.map((p) => {
              const val = sub[p.key] ?? 0;
              const g = goals[p.key] ?? p.goal;
              const partPct = Math.min(100, Math.round((val / g) * 100));
              return (
                <div key={p.key} className="rounded-xl border p-3">
                  <div className="mb-2 text-center text-sm font-extrabold">
                    {p.label} • {g}
                  </div>
                  <div className="mb-2 flex items-center gap-3">
                    <Progress value={partPct} className="h-3" />
                    <span className="tabular-nums text-sm font-bold">
                      {val} / {g}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="h-14 flex-1 text-base"
                      onClick={() => update(p.key, val + 1, g)}
                    >
                      +1
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-14"
                      onClick={() => update(p.key, 0, g)}
                    >
                      ↺
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-3" />
            <span className="tabular-nums text-sm font-bold">
              {current} / {goalTotal}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Invocation } from "@/data/invocations";
import { TranslationToggle } from "./TranslationToggle";
import { AudioButton } from "./AudioButton";
import { ChevronDown } from "lucide-react";

type Props = {
  inv: Invocation & { type: "simple" };
  value: number;
  setValue: (v: number) => void;
};

export function InvocationCard({ inv, value, setValue }: Props) {
  const [open, setOpen] = useState(false);
  const goal = typeof inv.goal === "number" ? inv.goal : null;
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;

  const bump = () => {
    const next = goal ? Math.min(goal, value + 1) : value + 1;
    setValue(next);
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
              {goal ? `${value}/${goal}` : value}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <AudioButton id={inv.id} />
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3">
          <div
            role="button"
            aria-label="Incrémenter"
            onClick={bump}
            onDoubleClick={bump}
            className="select-none rounded-lg border p-4 text-center text-2xl font-extrabold active:scale-[.99]"
          >
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

          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-3" />
            <span className="tabular-nums text-sm font-bold">
              {goal ? `${value} / ${goal}` : value}
            </span>
          </div>

          <div className="flex gap-2">
            <Button className="h-14 flex-1 text-base" onClick={bump}>
              +1
            </Button>
            <Button
              variant="secondary"
              className="h-14"
              onClick={() => setValue(0)}
            >
              ↺
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

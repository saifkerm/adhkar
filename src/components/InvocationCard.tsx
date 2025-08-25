import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Invocation } from "@/data/invocations";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useState } from "react";
import WordPlayer from "./WordPlayer";

type PlayerWord = { i: number; ar: string; tr?: string };

type PlayerProps = {
  audioPath?: string;
  vttPath?: string;
  words: PlayerWord[];
  translation?: string;
  defaultSpeed?: number;
  defaultCenter?: boolean;
  className?: string;
};

type Props = {
  inv: Invocation & { type: "simple" };
  value: number;
  setValue: (v: number) => void;
  player?: PlayerProps; // si fourni => lecture mot-à-mot
};

export default function InvocationCard({
  inv,
  value,
  setValue,
  player,
}: Props) {
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
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 text-left"
        >
          <CardTitle className="text-[15px] sm:text-base font-extrabold leading-tight">
            {inv.title}
          </CardTitle>

          <span className="ml-auto rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums">
            {goal ? `${value}/${goal}` : value}
          </span>

          <ChevronDown
            className={`ml-1 h-4 w-4 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          {/* Texte + audio mot-à-mot si dispo, sinon fallback transcription */}
          {player?.words.length ? (
            <WordPlayer
              audioPath={player.audioPath}
              vttPath={player.vttPath}
              words={player.words}
              translation={player.translation ?? inv.translation}
              defaultSpeed={player.defaultSpeed ?? 1}
              defaultCenter={player.defaultCenter ?? true}
              className="rounded-xl border border-border/60 p-2"
            />
          ) : (
            <div className="rounded-xl border border-border/60 p-4 text-center">
              <p dir="rtl" className="text-md font-extrabold leading-relaxed">
                {inv.transcription}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {inv.translation}
              </p>
            </div>
          )}

          {/* Meta comprimées */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-[11px] text-muted-foreground">
              Ablutions&nbsp;: {inv.requiresWudu ? "requises" : "non requises"}
            </span>
            {inv.source.url ? (
              <a
                href={inv.source.url}
                target="_blank"
                className="rounded-full border px-3 py-1 text-[11px] text-primary underline"
              >
                Source&nbsp;: {inv.source.reference}
              </a>
            ) : (
              <span className="rounded-full border px-3 py-1 text-[11px] text-muted-foreground">
                Source&nbsp;: {inv.source.reference}
              </span>
            )}
          </div>

          {/* Progression */}
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2.5" />
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {goal ? `${value} / ${goal}` : value}
            </span>
          </div>

          {/* Actions minimales */}
          <div className="flex items-center gap-2">
            <Button
              className="h-12 flex-1 text-base font-extrabold"
              onClick={bump}
            >
              +1
            </Button>
            <Button
              variant="secondary"
              className="h-12 w-12 p-0"
              onClick={() => setValue(0)}
              title="Réinitialiser"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

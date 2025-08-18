import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { Invocation } from "@/data/invocations"
import { TranslationToggle } from "./TranslationToggle"
import { AudioButton } from "./AudioButton"

type Props = {
  inv: Invocation
  value: number
  setValue: (v: number) => void
}

export function InvocationCard({ inv, value, setValue }: Props) {
  const goal = typeof (inv as any).goal === "number" ? ((inv as any).goal as number) : null
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0

  const bump = () => {
    const next = goal ? Math.min(goal, value + 1) : value + 1
    setValue(next)
    try { (navigator as any).vibrate?.(8) } catch {}
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-extrabold">{inv.title}</CardTitle>
          <div className="ml-auto">
            <AudioButton id={inv.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          role="button"
          aria-label="Incrémenter"
          onClick={bump}
          onDoubleClick={bump}
          className="select-none rounded-lg border p-4 text-center text-xl font-extrabold active:scale-[.99]"
        >
          {inv.transcription}
        </div>

        <TranslationToggle text={inv.translation} />

        <div className="flex flex-wrap items-center gap-2">
          {inv.moment?.map((m) => (
            <span key={m} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{m}</span>
          ))}
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Ablutions: {inv.wudu}</span>
          {inv.sourceUrl ? (
            <a href={inv.sourceUrl} target="_blank" className="rounded-full border px-3 py-1 text-xs text-primary underline">
              Source: {inv.source}
            </a>
          ) : (
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Source: {inv.source}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2" />
          <span className="tabular-nums text-sm font-bold">{goal ? `${value} / ${goal}` : value}</span>
        </div>

        <div className="flex gap-2">
          <Button className="h-12 flex-1 text-base" onClick={bump}>+1</Button>
          <Button variant="secondary" className="h-12" onClick={() => setValue(0)}>↺</Button>
        </div>
      </CardContent>
    </Card>
  )
}
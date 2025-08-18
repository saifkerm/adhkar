import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function App() {
  const [count, setCount] = useState(0);
  const goal = 33;
  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <header className="max-w-2xl mx-auto flex items-center gap-3">
        <h1 className="text-xl font-extrabold">Adhkâr</h1>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="dark"
            onCheckedChange={(v) =>
              document.documentElement.classList.toggle("dark", v)
            }
          />
          <Label htmlFor="dark" className="text-sm">
            Thème sombre
          </Label>
        </div>
      </header>

      <section className="max-w-2xl mx-auto mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subḥānallāh (33)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border text-center p-3 font-extrabold text-lg">
              Subḥānallāh
            </div>
            <div className="flex items-center gap-3">
              <Progress value={pct} className="h-2" />
              <span className="text-sm font-bold tabular-nums">
                {count} / {goal}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setCount((v) => Math.min(goal, v + 1))}
              >
                +1
              </Button>
              <Button variant="secondary" onClick={() => setCount(0)}>
                ↺
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

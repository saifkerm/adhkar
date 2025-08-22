import { PRAYERS } from "@/data/invocations";
import { cn } from "@/lib/utils";

function Ring({ pct }: { pct: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative h-11 w-11">
      <svg viewBox="0 0 40 40" className="h-11 w-11 rotate-[-90deg]">
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke="var(--color-border)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-primary transition-[stroke-dasharray] duration-300"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-[10px] font-bold">
        {Math.round(pct)}%
      </div>
    </div>
  );
}

export function HeaderPrayers({
  active,
  onChange,
  getPct,
}: {
  active: string;
  onChange: (label: string) => void;
  getPct: (label: string) => number;
}) {
  return (
    <div className="no-scrollbar sa-px overflow-x-auto">
      <div className="mx-auto flex max-w-screen-md gap-3 px-2 pb-2">
        {PRAYERS.map((label) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => onChange(label)}
              className={cn(
                "flex min-w-[74px] flex-col items-center gap-1 rounded-xl border px-2 py-2",
                isActive ? "border-primary bg-secondary" : "bg-background"
              )}
            >
              <Ring pct={getPct(label)} />
              <span
                className={cn(
                  "text-[11px] font-extrabold",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label.replace("Après ", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

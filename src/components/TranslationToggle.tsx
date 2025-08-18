import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function TranslationToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Traduction (FR)</span>
        <span className="flex items-center gap-1 text-primary">
          {open ? "Masquer" : "Afficher"}
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="px-4 pb-3 pt-2 text-[15px] leading-relaxed">{text}</div>}
    </div>
  )
}
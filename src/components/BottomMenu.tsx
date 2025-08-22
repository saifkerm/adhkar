import { Fragment } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabKey = "apres" | "matin" | "soir" | "journee" | "sommeil" | "tout";

export function BottomMenu({
  open,
  onClose,
  value,
  onSelect,
}: {
  open: boolean;
  value: TabKey;
  onClose: () => void;
  onSelect: (v: TabKey) => void;
}) {
  if (!open) return null;
  const items: Array<{ v: TabKey; label: string; hint?: string }> = [
    { v: "apres", label: "Prières", hint: "Après la prière" },
    { v: "matin", label: "Matin" },
    { v: "soir", label: "Soir" },
    { v: "journee", label: "Toute la journée" },
    { v: "sommeil", label: "Avant de dormir" },
    { v: "tout", label: "Tout" },
  ];
  return (
    <Fragment>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="sa-pb fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border bg-background p-3">
        <div className="mx-auto flex max-w-screen-md items-center">
          <div className="text-sm font-extrabold">Menu</div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-9 w-9"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mx-auto mt-2 grid max-w-screen-md gap-2">
          {items.map((it) => (
            <button
              key={it.v}
              onClick={() => {
                onSelect(it.v);
                onClose();
              }}
              className={`flex items-center justify-between rounded-xl border px-3 py-3 text-[15px] ${
                value === it.v ? "border-primary bg-secondary" : ""
              }`}
            >
              <span className="font-extrabold">{it.label}</span>
              <span className="text-xs text-muted-foreground">
                {it.hint ?? ""}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

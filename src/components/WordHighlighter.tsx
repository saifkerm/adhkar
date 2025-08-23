
export type Word = { i: number; ar: string; tr?: string };

export default function WordHighlighter({
  words,
  active,
  onSeek,
  translationWords,
  translationActiveIndex,
}: {
  words: Word[];
  active: number;
  onSeek: (i: number) => void;
  translationWords?: string[];
  translationActiveIndex?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-dashed border-border p-2 ar">
        <p dir="rtl" className="whitespace-nowrap text-center text-3xl md:text-4xl font-extrabold">
          {words.map((w) => (
            <button
              key={w.i}
              data-idx={w.i}
              className={`px-1 rounded ${active === w.i ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => onSeek(w.i)}
            >
              {w.ar}{" "}
            </button>
          ))}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dashed border-border p-2 tr">
        <p className="whitespace-nowrap text-center text-xl font-semibold">
          {words.map((w) => (
            <button
              key={w.i}
              data-idx={w.i}
              className={`px-1 rounded ${active === w.i ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => onSeek(w.i)}
            >
              {w.tr ?? ""}{" "}
            </button>
          ))}
        </p>
      </div>

      {translationWords && (
        <p className="text-center text-muted-foreground max-w-prose mx-auto">
          {translationWords.map((tw, k) => (
            <span
              key={k}
              className={`px-1 rounded ${k === translationActiveIndex ? "bg-primary text-primary-foreground" : ""}`}
            >
              {tw + (k < translationWords.length - 1 ? " " : "")}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

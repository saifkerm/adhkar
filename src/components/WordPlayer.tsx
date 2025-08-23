import { type Cue, loadVtt } from "@/lib/parseVtt";
import { useEffect, useMemo, useRef, useState } from "react";

export type Word = { i: number; ar: string; tr?: string };

type Props = {
  audioPath?: string;
  vttPath?: string;
  words: Word[];
  translation?: string;
  defaultSpeed?: number;
  defaultCenter?: boolean;
  className?: string;
};

// URLs absolues inchangées. Sinon, on retourne un chemin path-only basé sur BASE_URL.
// En dev (BASE_URL="/") => "/media/..."; en prod GH Pages (BASE_URL="/adhkar/") => "/adhkar/media/..."
const toPublicUrl = (p?: string) => {
  if (!p) return "";
  if (/^(?:https?:)?\/\//i.test(p) || /^blob:|^data:/i.test(p)) return p;
  const base = (import.meta.env?.BASE_URL ?? "/"); // "/" en dev, "/adhkar/" en prod
  const left = base.replace(/\/+$/g, "");
  const right = p.replace(/^\.?\//, "");
  return `${left}/${right}`.replace(/\/{2,}/g, "/");
};

export default function WordPlayer({
  audioPath,
  vttPath,
  words,
  translation,
  defaultSpeed = 1,
  defaultCenter = true,
  className,
}: Props) {
  const audioUrl = useMemo(() => toPublicUrl(audioPath), [audioPath]);
  const vttUrl = useMemo(() => toPublicUrl(vttPath), [vttPath]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [center, setCenter] = useState(defaultCenter);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!vttUrl) return;
    loadVtt(vttUrl).then(setCues).catch((e) => {
      console.error("VTT load error:", e, vttUrl);
    });
  }, [vttUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!playing) return;

    const loop = () => {
      const a = audioRef.current;
      if (!a || !cues.length) return;
      const t = a.currentTime * 1000;
      let idx = cues.findIndex((c) => t >= c.start && t < c.end);
      if (idx === -1) {
        if (t >= cues[cues.length - 1].end) {
          setActive(cues.length - 1);
          setPlaying(false);
          return;
        }
        idx = 0;
      }
      setActive(idx);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, cues]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => setPlaying(false);
    const onError = () => {
      // code 2 = MEDIA_ERR_NETWORK (souvent 404). Ouvre l’URL dans l’onglet pour vérifier si besoin.
      console.error("Audio error",a.error, a.error?.code ?? "unknown", { src: a.currentSrc });
    };
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, []);

  const seekTo = (i: number) => {
    const a = audioRef.current;
    if (!a || !cues.length) return;
    const s = cues[i]?.start ?? 0;
    a.currentTime = s / 1000;
    setActive(i);
  };

  const total = cues.length || 1;
  const progressPct = (() => {
    if (!cues.length || !audioRef.current) return 0;
    const t = audioRef.current.currentTime * 1000;
    const totalDur = cues[cues.length - 1].end;
    return Math.max(0, Math.min(100, Math.round((t / totalDur) * 100)));
  })();

  useEffect(() => {
    if (!center) return;
    const ar = document.querySelector<HTMLElement>(`.ar [data-idx="${active}"]`);
    const tr = document.querySelector<HTMLElement>(`.tr [data-idx="${active}"]`);
    ar?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    tr?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active, center]);

  const playPause = async () => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    try {
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        if (a.readyState < 2) a.load();
        await a.play();
        setPlaying(true);
      }
    } catch (err) {
      console.error("play() failed:", err, { src: a.currentSrc });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        void playPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [audioUrl, playPause, playing]);

  const frWords = useMemo(() => (translation ? translation.split(/\s+/) : []), [translation]);
  const frIdx = translation
    ? Math.min(frWords.length - 1, Math.round((active / Math.max(1, total - 1)) * (frWords.length - 1)))
    : -1;

  const hasAudio = !!audioUrl;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 h-10 rounded-lg border border-border bg-secondary text-foreground disabled:opacity-50"
            onClick={playPause}
            aria-pressed={playing}
            disabled={!hasAudio}
            title={hasAudio ? "Lire/Pause" : "Pas d’audio pour cet élément"}
          >
            {playing ? "Pause" : "Lire"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Vitesse</label>
          <select
            className="h-10 rounded-lg border border-border bg-card px-2"
            value={String(speed)}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          >
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={center} onChange={(e) => setCenter(e.target.checked)} />
            Centrer
          </label>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-border">
        <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-dashed border-border p-2 ar">
        <div dir="rtl" className="flex items-center gap-1 text-3xl md:text-4xl font-extrabold min-w-max">
          {words.map((w) => (
            <button
              key={w.i}
              data-idx={w.i}
              className={`px-1 rounded whitespace-nowrap flex-shrink-0 ${active === w.i ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => seekTo(w.i)}
            >
              {w.ar}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 overflow-x-auto rounded-xl border border-dashed border-border p-2 tr">
        <div className="flex items-center gap-1 text-xl font-semibold min-w-max">
          {words.map((w) => (
            <button
              key={w.i}
              data-idx={w.i}
              className={`px-1 rounded whitespace-nowrap flex-shrink-0 ${active === w.i ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => seekTo(w.i)}
            >
              {w.tr ?? ""}
            </button>
          ))}
        </div>
      </div>

      {translation && (
        <p className="mt-3 text-center text-muted-foreground max-w-prose mx-auto">
          {translation}
        </p>
      )}

      {/* Ne pas rendre l'audio si l'URL est vide */}
      {hasAudio && (
        <audio
          key={audioUrl}
          ref={audioRef}
          src={audioUrl || undefined}
          preload="metadata"
          playsInline
          className="hidden"
        />
      )}
    </div>
  );
}

import type { Cue } from "@/lib/parseVtt";
import { useEffect, useMemo, useRef, useState } from "react";

export function useWordSync(opts: {
  audioRef: React.RefObject<HTMLAudioElement>;
  cues: Cue[];
  translation?: string;
  autoCenter?: boolean;
}) {
  const { audioRef, cues, translation, autoCenter = true } = opts;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [center, setCenter] = useState(autoCenter);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = speed;
  }, [speed, audioRef]);

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
  }, [playing, cues, audioRef]);

  const seekTo = (i: number) => {
    const a = audioRef.current;
    if (!a || !cues.length) return;
    const s = cues[i]?.start ?? 0;
    a.currentTime = s / 1000;
    setActive(i);
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try { await a.play(); setPlaying(true); } catch {}
    }
  };

  const progressPct = useMemo(() => {
    const a = audioRef.current;
    if (!a || !cues.length) return 0;
    const t = a.currentTime * 1000;
    const total = cues[cues.length - 1].end;
    return Math.max(0, Math.min(100, Math.round((t / total) * 100)));
  }, [audioRef, cues, active]); // active force rafraîchissement

  const frWords = useMemo(() => (translation ? translation.split(/\s+/) : []), [translation]);
  const frIdx = translation
    ? Math.min(frWords.length - 1, Math.round((active / Math.max(1, cues.length - 1)) * (frWords.length - 1)))
    : -1;

  useEffect(() => {
    if (!center) return;
    const ar = document.querySelector<HTMLElement>(`.ar [data-idx="${active}"]`);
    const tr = document.querySelector<HTMLElement>(`.tr [data-idx="${active}"]`);
    ar?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    tr?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active, center]);

  return { active, setActive, toggle, playing, setPlaying, seekTo, speed, setSpeed, center, setCenter, progressPct, frWords, frIdx };
}

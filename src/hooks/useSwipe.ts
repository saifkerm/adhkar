import { useRef, useEffect } from "react";

export function useSwipe<T extends HTMLElement>(opts: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = opts.threshold ?? 40;
    let startX = 0,
      startY = 0,
      dx = 0,
      dy = 0,
      active = false;

    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      dx = 0;
      dy = 0;
      active = true;
    };
    const move = (e: TouchEvent) => {
      if (!active) return;
      const t = e.touches[0];
      dx = t.clientX - startX;
      dy = t.clientY - startY;
    };
    const end = () => {
      if (!active) return;
      active = false;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) opts.onSwipeLeft?.();
        else opts.onSwipeRight?.();
      }
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
    };
  }, [opts, opts.onSwipeLeft, opts.onSwipeRight, opts.threshold]);
  return ref;
}

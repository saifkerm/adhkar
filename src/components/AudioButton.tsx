import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

const AUDIO_BASE = "https://archive.org/download/HisnulMuslimAudio_201510/";
const AUDIO_MAP: Record<string, string> = {
  "subhan-wa-bi-hamdih": "n130.mp3",
  "tahlil-100": "n27.mp3",
  istighfar: "n132.mp3",
  "salat-ala-nabi": "n107.mp3",
  "tasbih-post-salah": "n25.mp3",
  "tasbih-sommeil": "n111.mp3",
};

let sharedAudio: HTMLAudioElement | null = null;

export function AudioButton({ id }: { id: string }) {
  const file = AUDIO_MAP[id];
  const [playing, setPlaying] = useState(false);
  const stopTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
    };
  }, []);

  if (!file) return null;

  const onClick = async () => {
    if (!sharedAudio) {
      sharedAudio = new Audio();
      sharedAudio.preload = "none";
    }
    if (playing) {
      sharedAudio.pause();
      setPlaying(false);
      return;
    }
    sharedAudio.pause();
    sharedAudio.src = AUDIO_BASE + file;
    sharedAudio.currentTime = 0;
    try {
      await sharedAudio.play();
      setPlaying(true);
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
      stopTimer.current = window.setTimeout(() => {
        sharedAudio?.pause();
        setPlaying(false);
      }, 16000);
      sharedAudio.onended = () => setPlaying(false);
      sharedAudio.onerror = () => setPlaying(false);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`h-10 rounded-full px-3 font-extrabold text-white ${
        playing ? "bg-red-700" : "bg-red-600"
      }`}
      variant="default"
      aria-label={playing ? "Pause" : "Lire"}
    >
      {playing ? (
        <PauseIcon className="mr-2 h-4 w-4" />
      ) : (
        <PlayIcon className="mr-2 h-4 w-4" />
      )}
      {playing ? "Pause" : "Lire"}
    </Button>
  );
}

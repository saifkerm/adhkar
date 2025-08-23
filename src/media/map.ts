import type { Word } from "@/components/WordHighlighter";

export type MediaEntry = {
  audio: string; // chemin depuis /public
  vtt: string;
  words: Word[];
  translation?: string;
};

const base = (p: string) => (import.meta.env.BASE_URL + p.replace(/^\//, ""));

export const mediaByInvocationId: Record<string, MediaEntry> = {
  // Exemple : id existant "subhan-wa-bi-hamdih" (ou adapte au tien)
  "subhan-wa-bi-hamdih": {
    audio: base("media/dhikr/subhan-3p3s.mp3"),
    vtt: base("media/dhikr/subhan-3p3s.vtt"),
    words: [
      { i: 0, ar: "سُبْحَانَ", tr: "Subḥān" },
      { i: 1, ar: "اللّٰهِ", tr: "Allāh" },
      { i: 2, ar: "وَبِحَمْدِهِ", tr: "wa bi-ḥamdih" },
    ],
    translation: "Gloire à Allah et louange à Lui.",
  },

  // Ajoute ici d’autres ids → fichiers + segmentation VTT + mots
};

import type { Word } from "@/components/WordPlayer";

// 2 mots : "Astaghfiru" + "Allāh"
export const istighfarWords: Word[] = [
  { i: 0, ar: "أَسْتَغْفِرُ", tr: "Astaghfiru" },
  { i: 1, ar: "اللّٰهَ", tr: "Allāh" },
];

export const istighfarTranslation = "Je demande pardon à Allah.";

// Chemins (dossier public/)
export const istighfarAudio =
  "media/dhikr/astaghfir-3p3s.mp3"; // renomme ton mp3 ainsi pour éviter les espaces
export const istighfarVtt =
  "media/dhikr/astaghfir-3p3s.vtt";

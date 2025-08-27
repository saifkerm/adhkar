import type { Word } from "@/components/WordPlayer";
import { istighfarAudio, istighfarVtt, istighfarWords } from "./dhikr/astaghfir";
import { lailahaAudio, lailahaTranslation, lailahaVtt, lailahaWords } from "./dhikr/la-ilaha";
import { subhanAudio, subhanVtt, subhanWords } from "./dhikr/subhan";

// Énumérations pour éviter la duplication des chaînes
export enum PrayerTime {
  FAJR = "Après Fajr",
  DHUHR = "Après Dhuhr",
  ASR = "Après ʿAsr",
  MAGHRIB = "Après Maghrib",
  ISHA = "Après ʿIshā'",
}

export enum DhikrMoment {
  MORNING = "Matin",
  EVENING = "Soir",
  ALL_DAY = "Toute la journée",
  BEFORE_SLEEP = "Avant de dormir",
  AFTER_PRAYER = "Après la prière",
  FRIDAY_RECOMMENDED = "Vendredi (recommandé)",
}

// Types de base simplifiés
export type TriplePart = {
  key: string;
  label: string;
  goal: number;
};

export type MomentGoals = Record<string, Record<string, number>>;

export type Source = {
  reference: string;
  url?: string;
};

// Interface de base pour les invocations
interface BaseInvocation {
  id: string;
  title: string;
  transcription: string;
  translation: string;
  moments: (PrayerTime | DhikrMoment)[];
  requiresWudu: boolean;
  source: Source;
  words?: Word[]
  audio?: string
  vtt?: string
}

// Invocation simple avec un objectif fixe
export interface SimpleInvocation extends BaseInvocation {
  type: "simple";
  goal: number | null;
}

// Invocation triple avec des parties distinctes
export interface TripleInvocation extends BaseInvocation {
  type: "triple";
  parts: TriplePart[];
  momentGoals?: MomentGoals;
}

export type Invocation = SimpleInvocation | TripleInvocation;

// Configuration des invocations - plus DRY
const COMMON_POST_PRAYER_MOMENTS = [
  PrayerTime.FAJR,
  PrayerTime.DHUHR,
  PrayerTime.ASR,
  PrayerTime.MAGHRIB,
  PrayerTime.ISHA,
];

const MORNING_EVENING_MOMENTS = [PrayerTime.FAJR, PrayerTime.MAGHRIB];

export const INVOCATIONS: Invocation[] = [
  {
    id: "istighfar-3-post-salah",
    title: "Astaghfirullāh (après la prière)",
    transcription: "Astaghfirullāh",
    translation: "Je demande pardon à Allah",
    type: "simple",
    moments: COMMON_POST_PRAYER_MOMENTS,
    requiresWudu: false,
    source: {
      reference: "Sahih Muslim 591",
      url: "https://sunnah.com/muslim:2691",
    },
    goal: 3,
    words: istighfarWords,
    audio: istighfarAudio,
    vtt: istighfarVtt
  },
  {
    id: "salam-post-salah",
    title: "Allāhumma anta-s-salām…",
    transcription:
      "Allāhumma anta-s-salām wa minka-s-salām, tabārakta yā dhā-l-jalāl wal-ikrām",
    translation:
      "Ô Allah, Tu es la Paix et de Toi vient la Paix. Béni sois-Tu, ô Détenteur de Majesté et de Munificence",
    type: "simple",
    moments: COMMON_POST_PRAYER_MOMENTS,
    requiresWudu: false,
    source: {
      reference: "Sahih Muslim 591",
      url: "https://sunnah.com/muslim:2691",
    },
    goal: 1,
  },

  {
    id: "tasbih-post-salah",
    title: "Tasbîḥ après la prière (33/33/33)",
    transcription:
      "Subḥānallāh (33) – Al-ḥamdu li-llāh (33) – Allāhu akbar (33)",
    translation: "Gloire à Allah – Louange à Allah – Allah est le Plus Grand",
    type: "triple",
    moments: [DhikrMoment.AFTER_PRAYER, ...COMMON_POST_PRAYER_MOMENTS],
    requiresWudu: false,
    source: { reference: "Sahih Muslim" },
    parts: [
      { key: "subhanallah", label: "Subḥānallāh", goal: 33 },
      { key: "alhamdulillah", label: "Al-ḥamdu li-llāh", goal: 33 },
      { key: "allahuakbar", label: "Allāhu akbar", goal: 33 },
    ],
  },

  {
    id: "tahlil-post-salah-once",
    title: "Tahlīl (compléter après la prière)",
    transcription:
      "Lā ilāha illā Allāh, waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa huwa ʿalā kulli shay'in qadīr",
    type: "simple",
    moments: [DhikrMoment.AFTER_PRAYER, ...COMMON_POST_PRAYER_MOMENTS],
    requiresWudu: false,
    source: { reference: "Sahih Muslim" },
    goal: 1,
    translation: lailahaTranslation,
    words: lailahaWords,
    audio: lailahaAudio,
    vtt: lailahaVtt
  },

  {
    id: "ayat-kursi",
    title: "Āyat al-Kursī (2:255)",
    transcription: "Āyat al-Kursī (2:255)",
    translation:
      "Allah ! Nulle divinité en dehors de Lui, le Vivant, Celui qui subsiste par Lui-même…",
    type: "simple",
    moments: COMMON_POST_PRAYER_MOMENTS,
    requiresWudu: false,
    source: {
      reference: "Coran 2:255",
      url: "https://quran.com/2/255",
    },
    goal: 1,
  },

  {
    id: "three-quls",
    title: "Sourates 112, 113, 114",
    transcription:
      "Qul huwa-llāhu aḥad • Qul aʿūdhu birabbil-falaq • Qul aʿūdhu birabbin-nās",
    translation:
      "Dis : Il est Allah, Unique • Dis : Je cherche refuge auprès du Seigneur de l'aube naissante • Dis : Je cherche refuge auprès du Seigneur des hommes",
    type: "triple",
    moments: COMMON_POST_PRAYER_MOMENTS,
    requiresWudu: false,
    source: {
      reference: "Sunan an-Nasa'i 1335",
      url: "https://sunnah.com/nasai:1335",
    },
    parts: [
      { key: "ikhlas", label: "S.112 — al-Ikhlāṣ", goal: 1 },
      { key: "falaq", label: "S.113 — al-Falaq", goal: 1 },
      { key: "nas", label: "S.114 — an-Nās", goal: 1 },
    ],
    momentGoals: {
      [PrayerTime.FAJR]: { ikhlas: 3, falaq: 3, nas: 3 },
      [PrayerTime.MAGHRIB]: { ikhlas: 3, falaq: 3, nas: 3 },
      [PrayerTime.DHUHR]: { ikhlas: 1, falaq: 1, nas: 1 },
      [PrayerTime.ASR]: { ikhlas: 1, falaq: 1, nas: 1 },
      [PrayerTime.ISHA]: { ikhlas: 1, falaq: 1, nas: 1 },
    },
  },

  {
    id: "tahlil-10",
    title: "Tahlīl (10× — yuḥyī wa yumīt)",
    transcription:
      "Lā ilāha illā Allāh waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, yuḥyī wa yumīt, wa huwa ʿalā kulli shay'in qadīr",
    type: "simple",
    moments: MORNING_EVENING_MOMENTS,
    requiresWudu: false,
    source: {
      reference: "Jami` at-Tirmidhi 3474",
      url: "https://sunnah.com/tirmidhi:3474",
    },
    goal: 10,
    translation: lailahaTranslation,
    words: lailahaWords,
    audio: lailahaAudio,
    vtt: lailahaVtt
  },

  {
    id: "duaa-ilman-nafian",
    title: "Invocation du matin après Fajr",
    transcription:
      "Allāhumma innī as'aluka ʿilman nāfiʿan, wa rizqan ṭayyiban, wa ʿamalan mutaqabbalan",
    translation:
      "Ô Allah, je Te demande une science utile, une subsistance licite et des œuvres agréées",
    type: "simple",
    moments: [PrayerTime.FAJR],
    requiresWudu: false,
    source: {
      reference: "Sunan Ibn Majah 925",
      url: "https://sunnah.com/ibnmajah:925",
    },
    goal: 1,
  },

  {
    id: "subhan-wa-bi-hamdih",
    title: "Subḥānallāh wa bi-ḥamdih (100×)",
    transcription: "Subḥānallāh wa bi-ḥamdih",
    translation: "Gloire à Allah et louange à Lui",
    type: "simple",
    moments: [DhikrMoment.MORNING, DhikrMoment.EVENING, DhikrMoment.ALL_DAY],
    requiresWudu: false,
    source: {
      reference: "Sahih Muslim 2691",
      url: "https://sunnah.com/muslim:2691",
    },
    goal: 100,
    words: subhanWords,
    audio: subhanAudio,
    vtt: subhanVtt
  },

  {
    id: "tahlil-100",
    title: "Tahlīl (100×)",
    transcription:
      "Lā ilāha illā Allāh waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa huwa ʿalā kulli shay'in qadīr",
    type: "simple",
    moments: [DhikrMoment.MORNING, DhikrMoment.EVENING],
    requiresWudu: false,
    source: {
      reference: "Sahih al-Bukhari 3293",
      url: "https://sunnah.com/bukhari:3293",
    },
    goal: 100,
    translation: lailahaTranslation,
    words: lailahaWords,
    audio: lailahaAudio,
    vtt: lailahaVtt
  },

  {
    id: "istighfar",
    title: "Astaghfirullāh (habituel)",
    transcription: "Astaghfirullāh",
    translation: "Je demande pardon à Allah",
    type: "simple",
    moments: [DhikrMoment.ALL_DAY],
    requiresWudu: false,
    source: {
      reference: "Sahih Muslim 2702",
      url: "https://sunnah.com/muslim:2702b",
    },
    goal: 100,
    words: istighfarWords,
    audio: istighfarAudio,
    vtt: istighfarVtt
  },

  {
    id: "salat-ala-nabi",
    title: "Ṣalāt ʿalā n-Nabī ﷺ",
    transcription: "Allāhumma ṣalli ʿalā Muḥammad wa ʿalā āli Muḥammad",
    translation: "Ô Allah, prie sur Muhammad et sur sa famille",
    type: "simple",
    moments: [DhikrMoment.ALL_DAY, DhikrMoment.FRIDAY_RECOMMENDED],
    requiresWudu: false,
    source: {
      reference: "Sahih al-Bukhari 6357",
      url: "https://sunnah.com/bukhari:6357",
    },
    goal: null,
  },

  {
    id: "tasbih-sommeil",
    title: "Tasbîḥ Fāṭima (avant de dormir — 33/33/34)",
    transcription:
      "Subḥānallāh (33) – Al-ḥamdu li-llāh (33) – Allāhu akbar (34)",
    translation: "Gloire à Allah – Louange à Allah – Allah est le Plus Grand",
    type: "triple",
    moments: [DhikrMoment.BEFORE_SLEEP],
    requiresWudu: false,
    source: {
      reference: "Sahih al-Bukhari 6318",
      url: "https://sunnah.com/bukhari:6318",
    },
    parts: [
      { key: "subhanallah-sleep", label: "Subḥānallāh", goal: 33 },
      { key: "alhamdulillah-sleep", label: "Al-ḥamdu li-llāh", goal: 33 },
      { key: "allahuakbar-sleep", label: "Allāhu akbar", goal: 34 },
    ],
  },
];

// Ordre d’affichage des 5 prières (header)
export const PRAYERS: PrayerTime[] = [
  PrayerTime.FAJR,
  PrayerTime.DHUHR,
  PrayerTime.ASR,
  PrayerTime.MAGHRIB,
  PrayerTime.ISHA,
];

// Configuration simplifiée des sections
export const SECTION_CONFIGURATIONS: Record<PrayerTime, string[]> = {
  [PrayerTime.FAJR]: [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tahlil-post-salah-once",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
    "tahlil-10",
    "duaa-ilman-nafian",
  ],
  [PrayerTime.DHUHR]: [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tahlil-post-salah-once",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
  [PrayerTime.ASR]: [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tahlil-post-salah-once",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
  [PrayerTime.MAGHRIB]: [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tahlil-post-salah-once",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
  [PrayerTime.ISHA]: [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tahlil-post-salah-once",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
};

// Fonctions utilitaires pour manipuler le modèle
export class InvocationService {
  static getInvocationsByMoment(
    moment: PrayerTime | DhikrMoment
  ): Invocation[] {
    return INVOCATIONS.filter((inv) => inv.moments.includes(moment));
  }

  static getInvocationById(id: string): Invocation | undefined {
    return INVOCATIONS.find((inv) => inv.id === id);
  }

  static getGoalForMoment(
    invocation: Invocation,
    moment: PrayerTime | DhikrMoment
  ): number | null {
    if (invocation.type === "simple") {
      return invocation.goal;
    }
    if (invocation.momentGoals && invocation.momentGoals[moment]) {
      return Object.values(invocation.momentGoals[moment]).reduce(
        (sum, goal) => sum + goal,
        0
      );
    }
    return invocation.parts.reduce((sum, part) => sum + part.goal, 0);
  }

  static getSectionOrder(prayerTime: PrayerTime): string[] {
    return SECTION_CONFIGURATIONS[prayerTime] || [];
  }
}

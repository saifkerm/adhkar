export type TriplePart = { key: string; label: string; goal: number };
export type TripleMomentGoals = Record<string, Record<string, number>>;

export type Invocation =
  | {
      id: string;
      title: string;
      transcription: string;
      translation: string;
      moment: string[];
      wudu: string;
      source: string;
      sourceUrl?: string;
      goal: number | null;
      type?: undefined;
    }
  | {
      id: string;
      title: string;
      transcription: string;
      translation: string;
      moment: string[];
      wudu: string;
      source: string;
      sourceUrl?: string;
      type: "triple";
      parts: TriplePart[];
      momentGoals?: TripleMomentGoals;
    };

export const INVOCATIONS: Invocation[] = [
  {
    id: "istighfar-3-post-salah",
    title: "Astaghfirullāh (après la prière)",
    transcription: "Astaghfirullāh",
    translation: "Je demande pardon à Allah",
    moment: [
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Hisn al-Muslim",
    goal: 3,
  },
  {
    id: "salam-post-salah",
    title: "Allāhumma anta-s-salām…",
    transcription:
      "Allāhumma anta-s-salām wa minka-s-salām, tabārakta yā dhā-l-jalāl wal-ikrām",
    translation:
      "Ô Allah, Tu es la Paix et de Toi vient la Paix. Béni sois-Tu, ô Détenteur de Majesté et de Munificence",
    moment: [
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Sahih Muslim",
    goal: 1,
  },
  {
    id: "tasbih-post-salah",
    title: "Tasbîḥ après la prière (33/33/33)",
    transcription:
      "Subḥānallāh (33) – Al-ḥamdu li-llāh (33) – Allāhu akbar (33)",
    translation: "Gloire à Allah – Louange à Allah – Allah est le Plus Grand",
    moment: [
      "Après la prière",
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Sahih Muslim",
    type: "triple",
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
      "Lā ilāha illā Allāh, waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa huwa ʿalā kulli shay’in qadīr",
    translation:
      "Nul n’est digne d’être adoré en dehors d’Allah, Unique, sans associé; à Lui la royauté et la louange; Il est capable de toute chose",
    moment: [
      "Après la prière",
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Sahih Muslim",
    goal: 1,
  },
  {
    id: "ayat-kursi",
    title: "Āyat al-Kursī (2:255)",
    transcription: "Āyat al-Kursī (2:255)",
    translation:
      "Allah ! Nulle divinité en dehors de Lui, le Vivant, Celui qui subsiste par Lui-même…",
    moment: [
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Coran 2:255",
    sourceUrl: "https://quran.com/2/255",
    goal: 1,
  },
  {
    id: "three-quls",
    title: "Sourates 112, 113, 114",
    transcription:
      "Qul huwa-llāhu aḥad • Qul aʿūdhu birabbil-falaq • Qul aʿūdhu birabbin-nās",
    translation:
      "Dis : Il est Allah, Unique • Dis : Je cherche refuge auprès du Seigneur de l’aube naissante • Dis : Je cherche refuge auprès du Seigneur des hommes",
    moment: [
      "Après Fajr",
      "Après Dhuhr",
      "Après ʿAsr",
      "Après Maghrib",
      "Après ʿIshā’",
    ],
    wudu: "Non",
    source: "Coran 112 • 113 • 114",
    type: "triple",
    parts: [
      { key: "ikhlas", label: "S.112 — al-Ikhlāṣ", goal: 1 },
      { key: "falaq", label: "S.113 — al-Falaq", goal: 1 },
      { key: "nas", label: "S.114 — an-Nās", goal: 1 },
    ],
    momentGoals: {
      "Après Fajr": { ikhlas: 3, falaq: 3, nas: 3 },
      "Après Maghrib": { ikhlas: 3, falaq: 3, nas: 3 },
      "Après Dhuhr": { ikhlas: 1, falaq: 1, nas: 1 },
      "Après ʿAsr": { ikhlas: 1, falaq: 1, nas: 1 },
      "Après ʿIshā’": { ikhlas: 1, falaq: 1, nas: 1 },
    },
  },
  {
    id: "tahlil-10",
    title: "Tahlīl (10× — yuḥyī wa yumīt)",
    transcription:
      "Lā ilāha illā Allāh waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, yuḥyī wa yumīt, wa huwa ʿalā kulli shay’in qadīr",
    translation:
      "Il n’y a de divinité qu’Allah, Unique, sans associé. À Lui la royauté et la louange. Il fait vivre et mourir, et Il est capable de toute chose",
    moment: ["Après Fajr", "Après Maghrib"],
    wudu: "Non",
    source: "Hisn al-Muslim",
    goal: 10,
  },
  {
    id: "duaa-ilman-nafian",
    title: "Invocation du matin après Fajr",
    transcription:
      "Allāhumma innī as’aluka ʿilman nāfiʿan, wa rizqan ṭayyiban, wa ʿamalan mutaqabbalan",
    translation:
      "Ô Allah, je Te demande une science utile, une subsistance licite et des œuvres agréées",
    moment: ["Après Fajr"],
    wudu: "Non",
    source: "Hisn al-Muslim",
    goal: 1,
  },

  {
    id: "subhan-wa-bi-hamdih",
    title: "Subḥānallāh wa bi-ḥamdih (100×)",
    transcription: "Subḥānallāh wa bi-ḥamdih",
    translation: "Gloire à Allah et louange à Lui",
    moment: ["Matin", "Soir", "Toute la journée"],
    wudu: "Non",
    source: "Sahih Muslim 2691",
    sourceUrl: "https://sunnah.com/muslim:2691",
    goal: 100,
  },
  {
    id: "tahlil-100",
    title: "Tahlīl (100×)",
    transcription:
      "Lā ilāha illā Allāh waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa huwa ʿalā kulli shay’in qadīr",
    translation: "Nul n’est digne d’être adoré en dehors d’Allah…",
    moment: ["Matin", "Soir"],
    wudu: "Non",
    source: "Sahih al-Bukhari 3293",
    sourceUrl: "https://sunnah.com/bukhari:3293",
    goal: 100,
  },
  {
    id: "istighfar",
    title: "Astaghfirullāh (habituel)",
    transcription: "Astaghfirullāh",
    translation: "Je demande pardon à Allah",
    moment: ["Toute la journée"],
    wudu: "Non",
    source: "Sahih Muslim 2702",
    sourceUrl: "https://sunnah.com/muslim:2702b",
    goal: 100,
  },
  {
    id: "salat-ala-nabi",
    title: "Ṣalāt ʿalā n-Nabī ﷺ",
    transcription: "Allāhumma ṣalli ʿalā Muḥammad wa ʿalā āli Muḥammad",
    translation: "Ô Allah, prie sur Muhammad et sur sa famille",
    moment: ["Toute la journée", "Vendredi (recommandé)"],
    wudu: "Non",
    source: "Sahih al-Bukhari 6357",
    sourceUrl: "https://sunnah.com/bukhari:6357",
    goal: null,
  },
  {
    id: "tasbih-sommeil",
    title: "Tasbîḥ Fāṭima (avant de dormir — 33/33/34)",
    transcription:
      "Subḥānallāh (33) – Al-ḥamdu li-llāh (33) – Allāhu akbar (34)",
    translation: "Gloire à Allah – Louange à Allah – Allah est le Plus Grand",
    moment: ["Avant de dormir"],
    wudu: "Non",
    source: "Sahih al-Bukhari 6318",
    sourceUrl: "https://sunnah.com/bukhari:6318",
    type: "triple",
    parts: [
      { key: "subhanallah-sleep", label: "Subḥānallāh", goal: 33 },
      { key: "alhamdulillah-sleep", label: "Al-ḥamdu li-llāh", goal: 33 },
      { key: "allahuakbar-sleep", label: "Allāhu akbar", goal: 34 },
    ],
  },
];

export const PRAYERS = [
  "Après Fajr",
  "Après Dhuhr",
  "Après ʿAsr",
  "Après Maghrib",
  "Après ʿIshā’",
] as const;

export const SECTION_ORDER: Record<(typeof PRAYERS)[number], string[]> = {
  "Après Fajr": [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
    "tahlil-10",
    "duaa-ilman-nafian",
  ],
  "Après Dhuhr": [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
  "Après ʿAsr": [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
  "Après Maghrib": [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
    "tahlil-10",
  ],
  "Après ʿIshā’": [
    "istighfar-3-post-salah",
    "salam-post-salah",
    "tasbih-post-salah",
    "tahlil-post-salah-once",
    "ayat-kursi",
    "three-quls",
  ],
};

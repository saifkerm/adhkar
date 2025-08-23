import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  DhikrMoment,
  INVOCATIONS,
  PrayerTime,
  type Invocation,
  type SimpleInvocation,
  type TripleInvocation,
} from "@/data/invocations";

import InvocationCard from "@/components/InvocationCard";
import { type Word as PlayerWord } from "@/components/WordPlayer";

/* ---------- Slugs -> moments ---------- */
type MomentSlug =
  | "apres-priere"
  | "matin"
  | "soir"
  | "toute-la-journee"
  | "avant-de-dormir"
  | "vendredi";

const SLUG_TO_MOMENT: Record<MomentSlug, DhikrMoment | PrayerTime> = {
  "apres-priere": DhikrMoment.AFTER_PRAYER,
  matin: DhikrMoment.MORNING,
  soir: DhikrMoment.EVENING,
  "toute-la-journee": DhikrMoment.ALL_DAY,
  "avant-de-dormir": DhikrMoment.BEFORE_SLEEP,
  vendredi: DhikrMoment.FRIDAY_RECOMMENDED,
};

const TITLE_BY_SLUG: Record<MomentSlug, string> = {
  "apres-priere": "Après la prière",
  matin: "Matin",
  soir: "Soir",
  "toute-la-journee": "Toute la journée",
  "avant-de-dormir": "Avant de dormir",
  vendredi: "Vendredi (recommandé)",
};

/* ---------- Ordre spécifique “Après la prière” ---------- */
const ORDER_AFTER_PRAYER = [
  "istighfar-3-post-salah",
  "salam-post-salah",
  "tasbih-post-salah",
  "tahlil-post-salah-once",
  "ayat-kursi",
  "three-quls",
];

/* ---------- Audio/Words disponibles (tu complètes au besoin) ---------- */
type AudioRes = {
  audioPath: string;
  vttPath: string;
  words: PlayerWord[];
  translation?: string;
};

const AUDIO_RESOURCES: Record<string, AudioRes | undefined> = {
  // Exemple prêt : Subḥānallāh wa bi-ḥamdih
  "subhan-wa-bi-hamdih": {
    audioPath: "media/dhikr/subhan-3p3s.mp3",
    vttPath: "media/dhikr/subhan-3p3s.vtt",
    words: [
      { i: 0, ar: "سُبْحَانَ", tr: "Subḥān" },
      { i: 1, ar: "اللّٰهِ", tr: "Allāh" },
      { i: 2, ar: "وَبِحَمْدِهِ", tr: "wa bi-ḥamdih" },
    ],
    translation: "Gloire à Allah et louange à Lui.",
  },
  // Tu peux ajouter d’autres ids (simple ou virtuels) ici.
};

/* ---------- Helpers & storage ---------- */
const STORAGE_KEY_BASE = "adhkar.moment.counts.v1";

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function isForMoment(inv: Invocation, m: PrayerTime | DhikrMoment) {
  return inv.moments.includes(m);
}

function partGoalForMoment(
  inv: TripleInvocation,
  partKey: string,
  moment: PrayerTime | DhikrMoment
) {
  const override = inv.momentGoals?.[moment as any];
  if (override && typeof override[partKey] === "number") return override[partKey];
  return inv.parts.find((p) => p.key === partKey)?.goal ?? 0;
}

/* “Virtualisation” : transformer une triple en plusieurs “simple” */
type ViewItem = {
  id: string; // storage id
  inv: SimpleInvocation & { type: "simple" };
  player?: AudioRes;
  groupId: string; // pour conserver l’ordre par groupe
  groupIndex: number;
};

function explodeForMoment(
  base: Invocation[],
  moment: PrayerTime | DhikrMoment
): ViewItem[] {
  const items: ViewItem[] = [];
  for (const inv of base) {
    if (inv.type === "simple") {
      const s = inv as SimpleInvocation;
      const id = s.id;
      items.push({
        id,
        inv: s,
        player: AUDIO_RESOURCES[id],
        groupId: s.id,
        groupIndex: 0,
      });
    } else {
      const t = inv as TripleInvocation;
      t.parts.forEach((p, idx) => {
        const vId = `${t.id}::${p.key}`; // id virtuel unique
        const v: SimpleInvocation = {
          id: vId,
          type: "simple",
          title: `${t.title} — ${p.label}`,
          transcription: p.label,
          translation: t.translation,
          moments: inv.moments,
          requiresWudu: t.requiresWudu,
          source: t.source,
          goal: partGoalForMoment(t, p.key, moment),
        };
        items.push({
          id: vId,
          inv: v,
          player: AUDIO_RESOURCES[vId], // optionnel si tu ajoutes une entrée
          groupId: t.id,
          groupIndex: idx,
        });
      });
    }
  }
  return items;
}

function sortForMoment(
  items: ViewItem[],
  moment: PrayerTime | DhikrMoment
): ViewItem[] {
  if (moment !== DhikrMoment.AFTER_PRAYER) return items;
  const order = new Map(ORDER_AFTER_PRAYER.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ga = order.has(a.groupId) ? (order.get(a.groupId) as number) : 999;
    const gb = order.has(b.groupId) ? (order.get(b.groupId) as number) : 999;
    if (ga !== gb) return ga - gb;
    return a.groupIndex - b.groupIndex;
  });
}

/* ---------- Page ---------- */
export default function MomentPage() {
  const { slug = "" } = useParams<{ slug: MomentSlug }>();
  const moment = SLUG_TO_MOMENT[slug as MomentSlug];

  const base = useMemo(
    () => (moment ? INVOCATIONS.filter((inv) => isForMoment(inv, moment)) : []),
    [moment]
  );

  const exploded = useMemo(
    () => (moment ? explodeForMoment(base, moment) : []),
    [base, moment]
  );

  const sorted = useMemo(
    () => (moment ? sortForMoment(exploded, moment) : exploded),
    [exploded, moment]
  );

  const storageKey = `${STORAGE_KEY_BASE}:${slug}`;

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const def: Record<string, number> = {};
    for (const it of sorted) def[it.id] = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return def;
      const parsed = JSON.parse(raw) as { date: string; counts: Record<string, number> };
      if (parsed.date !== todayKey()) return def;
      return { ...def, ...(parsed.counts || {}) };
    } catch {
      return def;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), counts }));
  }, [counts, storageKey]);

  /* Quand le slug ou la liste change (ordre / nouveaux ids), on hydrate avec des 0 pour les nouveaux */
  useEffect(() => {
    const def: Record<string, number> = {};
    for (const it of sorted) def[it.id] = 0;
    setCounts((prev) => ({ ...def, ...prev }));
  }, [slug, sorted.map((i) => i.id).join("|")]);

  if (!moment) {
    return (
      <main className="px-4 py-6">
        <div className="mx-auto max-w-[980px]">
          <p className="text-sm text-muted-foreground">Moment inconnu.</p>
          <Link to="/" className="underline text-primary">
            ← Retour
          </Link>
        </div>
      </main>
    );
  }

  const title = TITLE_BY_SLUG[slug as MomentSlug] || "Moment";

  const setValueFor = (id: string, goal: number | null) => (next: number) => {
    const clamped = goal == null ? Math.max(0, next) : Math.max(0, Math.min(goal, next));
    setCounts((prev) => ({ ...prev, [id]: clamped }));
  };

  return (
    <main className="px-4 py-4">
      <section className="mx-auto max-w-[980px] space-y-3">
        <h2 className="text-base font-extrabold">{title}</h2>

        {sorted.map(({ id, inv, player }) => {
          const value = counts[id] ?? 0;

          return (
            <InvocationCard
              key={id}
              inv={inv}
              value={value}
              setValue={setValueFor(id, typeof inv.goal === "number" ? inv.goal : null)}
              player={
                player
                  ? {
                      audioPath: player.audioPath,
                      vttPath: player.vttPath,
                      words: player.words,
                      translation: player.translation ?? inv.translation,
                      defaultSpeed: 1,
                      defaultCenter: true,
                    }
                  : undefined
              }
            />
          );
        })}
      </section>
    </main>
  );
}

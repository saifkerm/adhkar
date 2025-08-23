import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

type Tile = {
  slug: string;
  icon: string;
  label: string;
  hint?: string;
};

const TILES: Tile[] = [
  { slug: "apres-priere", icon: "🕌", label: "Après la prière", hint: "Fajr • Dhuhr • ʿAsr • Maghrib • ʿIshā'" },
  { slug: "matin", icon: "🌅", label: "Matin", hint: "Après Fajr" },
  { slug: "soir", icon: "🌆", label: "Soir", hint: "Après Maghrib" },
  { slug: "toute-la-journee", icon: "🔁", label: "Toute la journée", hint: "Compteurs libres" },
  { slug: "avant-de-dormir", icon: "🌙", label: "Avant de dormir", hint: "Tasbîḥ Fāṭima" },
  { slug: "vendredi", icon: "🕌✨", label: "Vendredi", hint: "Ṣalāt ʿalā n-Nabī" },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-4">
      {/* Header */}
      <header className="mx-auto max-w-[980px] mb-8">
        <div className="flex items-center justify-between mb-4">
          <div></div> {/* Spacer pour centrer le titre */}
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-2">Adhkâr</h1>
        <p className="text-center text-muted-foreground text-sm">
          Choisissez votre moment de prière ou de dhikr
        </p>
      </header>

      {/* Tuiles */}
      <section className="mx-auto max-w-[980px]">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
          Par moment
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {TILES.map((tile) => (
            <Link
              key={tile.slug}
              to={`/moment/${tile.slug}`}
              className="group rounded-2xl border border-border bg-card p-4 min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              aria-label={tile.label}
            >
              <div className="text-3xl leading-none transition-transform group-hover:scale-110">
                {tile.icon}
              </div>
              <div className="text-sm font-bold text-center leading-tight">
                {tile.label}
              </div>
              {tile.hint && (
                <div className="text-xs text-muted-foreground text-center leading-tight">
                  {tile.hint}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
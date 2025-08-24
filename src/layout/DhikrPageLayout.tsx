import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface DhikrPageLayoutProps {
  title: string;
  progressPct: number;
  /** Action(s) à afficher à droite du titre (boutons, etc.) */
  resetGlobal?: any;
  /** Élément inséré en bas du header (ex. HeaderPrayers) */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * Layout commun aux pages de dhikr (hors Home).
 * Reprend exactement la structure HTML/CSS du dépôt.
 */
export const DhikrPageLayout: FC<DhikrPageLayoutProps> = ({
  title,
  progressPct,
  resetGlobal,
  headerExtra,
  children,
}) => {
  return (
    <main className="min-h-dvh bg-background text-foreground sa-pb">
      <header className="sa-pt sticky top-0 z-20 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="sa-px mx-auto flex max-w-screen-md flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[20px] font-extrabold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            {<Button
              size="sm"
              variant="destructive"
              className="h-9 rounded-lg px-3 whitespace-nowrap"
              onClick={resetGlobal}
            >
              <span className="inline sm:hidden">Réinit.</span>
              <span className="hidden sm:inline">Réinit. global</span>
            </Button>
          }
          </div>
        </div>
        {headerExtra}
      </header>

      {/* Section de progression */}
      <section className="mx-auto mt-2 max-w-screen-md px-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="w-fit rounded-full border px-2.5 py-1 text-[12px] text-muted-foreground">
            Progression
          </span>
          <div className="sm:flex-1">
            <Progress value={progressPct} className="h-3" />
          </div>
          <span className="w-fit rounded-full border px-2.5 py-1 text-[12px] font-bold">
            {progressPct}%
          </span>
        </div>
      </section>

      {/* Contenu spécifique de la page */}
      {children}
    </main>
  );
};

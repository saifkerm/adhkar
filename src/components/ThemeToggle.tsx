import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { resolveTheme, toggleTheme, applyTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [mode, setMode] = useState<Theme>(() => resolveTheme());

  const onClick = () => {
    const next = toggleTheme();
    setMode(next);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "adhkar-theme" &&
        (e.newValue === "light" || e.newValue === "dark")
      ) {
        applyTheme(e.newValue as Theme);
        setMode(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={onClick}
      aria-label={
        mode === "dark" ? "Passer en thème clair" : "Passer en thème sombre"
      }
      title={mode === "dark" ? "Thème clair" : "Thème sombre"}
    >
      <Sun className="hidden h-5 w-5 dark:block" />
      <Moon className="h-5 w-5 dark:hidden" />
    </Button>
  );
}

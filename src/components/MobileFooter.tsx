import { Button } from "@/components/ui/button";
import { Compass, Home, Settings } from "lucide-react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

export const MobileFooter: FC = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div
        className="flex justify-around items-center px-4 py-2 gap-6 pb-[env(safe-area-inset-bottom)]
        "
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full"
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5 text-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full"
          onClick={() => navigate('/qibla')}
        >
          <Compass className="h-5 w-5 text-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full"
          onClick={() => {
            /* TODO : ouvrir les paramètres */
          }}
        >
          <Settings className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </footer>
  );
};

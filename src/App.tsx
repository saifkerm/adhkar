import { Link, Route, Routes } from "react-router-dom";
import { MobileFooter } from "./components/MobileFooter";
import ApresPriere from "./pages/ApresPriere";
import AvantDeDormir from "./pages/AvantDeDormir";
import Home from "./pages/Home";
import Matin from "./pages/Matin";
import Qibla from "./pages/Qibla";
import Soir from "./pages/Soir";
import TouteLaJournee from "./pages/TouteLaJournee";
import Vendredi from "./pages/Vendredi";

export default function App() {
  return (
    <>
      <div className="pb-20">
        <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/moment/apres-priere" element={<ApresPriere />} />
        <Route path="/moment/matin" element={<Matin />} />
        <Route path="/moment/soir" element={<Soir />} />
        <Route path="/moment/toute-la-journee" element={<TouteLaJournee />} />
        <Route path="/moment/avant-de-dormir" element={<AvantDeDormir />} />
        <Route path="/moment/vendredi" element={<Vendredi />} />
        <Route path="/qibla" element={<Qibla />} />

        <Route
          path="/moment/:slug"
          element={
            <div className="min-h-dvh bg-background text-foreground p-8 text-center">
              <h1 className="mb-4 text-2xl font-bold">Page en construction</h1>
              <p className="mb-4 text-muted-foreground">
                Cette page sera bientôt disponible.
              </p>
              <Link to="/" className="text-primary underline">
                ← Retour à l'accueil
              </Link>
            </div>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-dvh bg-background text-foreground p-8 text-center">
              <h1 className="mb-4 text-2xl font-bold">Page introuvable</h1>
              <p className="mb-4 text-muted-foreground">
                L’URL demandée n’existe pas.
              </p>
              <Link to="/" className="text-primary underline">
                ← Retour à l'accueil
              </Link>
            </div>
          }
        />
        </Routes>
      </div>
      
      <MobileFooter />
    </>
    
  );
}

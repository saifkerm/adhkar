

import { BrowserRouter, Route, Routes } from "react-router-dom";
import ApresPriere from "./pages/ApresPriere";
import AvantDeDormir from "./pages/AvantDeDormir";
import Home from "./pages/Home";
import Matin from "./pages/Matin";
import Soir from "./pages/Soir";
import TouteLaJournee from "./pages/TouteLaJournee";
import Vendredi from "./pages/Vendredi";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/moment/apres-priere" element={<ApresPriere />} />
        <Route path="/moment/matin" element={<Matin />} />
        <Route path="/moment/soir" element={<Soir />} />
        <Route path="/moment/toute-la-journee" element={<TouteLaJournee />} />
        <Route path="/moment/avant-de-dormir" element={<AvantDeDormir />} />
        <Route path="/moment/vendredi" element={<Vendredi />} />
        
        {/* Route de fallback pour les autres slugs */}
        <Route path="/moment/:slug" element={
          <div className="min-h-dvh bg-background text-foreground p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Page en construction</h1>
            <p className="text-muted-foreground mb-4">Cette page sera bientôt disponible.</p>
            <a href="/" className="text-primary underline">← Retour à l'accueil</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}


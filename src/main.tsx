import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Import des pages
import App from "./App";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
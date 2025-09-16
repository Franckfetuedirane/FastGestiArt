import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { localStorageService } from "./services/localStorageService";

// Initialiser les données par défaut si nécessaire
localStorageService.initializeIfEmpty();

createRoot(document.getElementById("root")!).render(<App />);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AnalyticsProvider } from "./analytics/AnalyticsProvider.tsx";

// Mensaje de versión
//console.log('🚀 v2.1.0 | Actualizado:', new Date().toLocaleString('es-MX'));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AnalyticsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnalyticsProvider>
  </StrictMode>,
);

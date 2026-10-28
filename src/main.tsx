import { createRoot } from "react-dom/client";
import App from "./App";
import { AppProvider } from "./hooks/useApp";
import "./style.css";
import "./product.css";
import "./v2.css";
import "./health.css";
import "./routines.css";
import "./guide-visuals.css";
import "./child-v3.css";
import "./card-art-v3.css";
import "./sleep-v3.css";
import "./menu-v3.css";
import "./kit-v3.css";
import "./guide-v3.css";
import "./manuals-v3.css";
import "./nutrition-v3.css";
import "./more-v3.css";
import "./today-v3.css";
import "./quick-add-v3.css";
import "./voice-v3.css";
import "./recipe-visual-v3.css";
import "./recipes-v3.css";
import "./menu-visual-v4.css";
import "./safe-food-v3.css";
import "./readings-v3.css";
createRoot(document.getElementById("app")!).render(
  <AppProvider>
    <App />
  </AppProvider>,
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      console.warn(
        "BabyGuide: offline registration unavailable; retry with network.",
      );
    });
  });
}

import { createRoot } from "react-dom/client";
import App from "./App";
import { AppProvider } from "./hooks/useApp";
import "./style.css";
import "./product.css";
import "./v2.css";
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

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preInitConfetti } from "./lib/confetti";
import { restoreNativeStorage } from "./lib/persistentStorage";

// Pre-initialize confetti to avoid lag on first use
preInitConfetti();

const rootElement = document.getElementById("root");
if (rootElement) {
  // Restore saved data from native storage (iOS/Android) before the app reads localStorage
  restoreNativeStorage().finally(() => {
    createRoot(rootElement).render(<App />);
  });
} else {
  console.error("Root element not found");
}

// Register service worker for PWA support (only in production, not during local dev)
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("/service-worker.js").catch((error) => {
    console.warn("Service Worker registration failed:", error);
  });

  // When a new service worker takes over (i.e. a new version was deployed),
  // reload once so the user gets the fresh app shell without having to
  // manually reinstall the PWA. localStorage data is untouched by this.
  let refreshingAfterUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingAfterUpdate) return;
    refreshingAfterUpdate = true;
    window.location.reload();
  });
}

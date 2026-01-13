import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  const swPath = import.meta.env.MODE === "development" 
    ? "/service-worker.js"
    : "/stjernejakt-barnas-belonning/service-worker.js";
  navigator.serviceWorker.register(swPath).catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}


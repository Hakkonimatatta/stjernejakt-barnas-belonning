import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preInitConfetti } from "./lib/confetti";

// Debug for Android WebView
console.log("🚀 App starting...", { 
  userAgent: navigator.userAgent,
  viewport: { width: window.innerWidth, height: window.innerHeight },
  rootElement: document.getElementById("root")
});

// Pre-initialize confetti to avoid lag on first use
preInitConfetti();

// Extra guard: if module loading fails, surface it
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root not found after DOMContentLoaded");
  }
});

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("✅ Root element found, creating React app...");
  createRoot(rootElement).render(<App />);
  console.log("✅ React app mounted!");
} else {
  console.error("❌ Root element NOT found!");
}

// Register service worker for PWA support (only in production, not during local dev)
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("/service-worker.js").catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}


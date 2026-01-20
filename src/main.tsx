import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug for Android WebView
console.log("🚀 App starting...", { 
  userAgent: navigator.userAgent,
  viewport: { width: window.innerWidth, height: window.innerHeight },
  rootElement: document.getElementById("root")
});

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("✅ Root element found, creating React app...");
  createRoot(rootElement).render(<App />);
  console.log("✅ React app mounted!");
} else {
  console.error("❌ Root element NOT found!");
}

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}


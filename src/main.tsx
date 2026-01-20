import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug for Android WebView
console.log("App starting...", { 
  userAgent: navigator.userAgent,
  viewport: { width: window.innerWidth, height: window.innerHeight }
});

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}


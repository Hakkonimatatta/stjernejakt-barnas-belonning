import confetti, { Options } from "canvas-confetti";

let canvasEl: HTMLCanvasElement | null = null;
let confettiInstance: ReturnType<typeof confetti.create> | null = null;

function isAndroidWebView() {
  const ua = navigator.userAgent || "";
  return /Android/.test(ua) && /(wv|WebView)/i.test(ua);
}

function ensureInstance() {
  if (confettiInstance) return confettiInstance;

  canvasEl = document.createElement("canvas");
  canvasEl.style.position = "fixed";
  canvasEl.style.top = "0";
  canvasEl.style.left = "0";
  canvasEl.style.width = "100%";
  canvasEl.style.height = "100%";
  canvasEl.style.pointerEvents = "none";
  canvasEl.style.zIndex = "9999";
  document.body.appendChild(canvasEl);

  confettiInstance = confetti.create(canvasEl, {
    resize: true,
    useWorker: !isAndroidWebView(),
  });
  return confettiInstance;
}

function cleanup() {
  try {
    confettiInstance?.reset();
  } catch {}
  confettiInstance = null;
  if (canvasEl && canvasEl.parentNode) {
    canvasEl.parentNode.removeChild(canvasEl);
  }
  canvasEl = null;
}

export function fireConfetti(opts?: Options) {
  const instance = ensureInstance();
  const defaults: Options = {
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    disableForReducedMotion: false,
    ticks: 200,
    startVelocity: 35,
    scalar: 0.9,
  };

  instance({ ...defaults, ...(opts || {}) });

  window.setTimeout(() => {
    cleanup();
  }, 3000);
}

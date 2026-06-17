import { Language } from "@/lib/i18n";

const ICON = "/icon-180.png";

const notificationTexts: Record<Language, [string, string]> = {
  no: [
    "Hva skjer i dag? Gjør ett oppdrag!",
    "Tid for kveldsoppdrag?",
  ],
  en: [
    "What's happening today? Do a task!",
    "Time for an evening task?",
  ],
};

let scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

export const cancelNotifications = () => {
  scheduledTimeouts.forEach(clearTimeout);
  scheduledTimeouts = [];
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "DISABLE_NOTIFICATIONS" });
  }
};

const scheduleToday = (hour: number, title: string, body: string) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
  const ms = target.getTime() - now.getTime();
  if (ms > 0) {
    const id = setTimeout(() => {
      new Notification(title, { body, icon: ICON, tag: `stjernejobb-${hour}` });
    }, ms);
    scheduledTimeouts.push(id);
  }
};

const notifyServiceWorker = (language: Language, times: [number, number]) => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const texts = notificationTexts[language] ?? notificationTexts.no;
  const config = { enabled: true, times, texts, title: "Stjernejobb ⭐", icon: ICON };
  const send = (ctrl: ServiceWorker) => ctrl.postMessage({ type: "SCHEDULE_NOTIFICATIONS", config });
  if (navigator.serviceWorker.controller) {
    send(navigator.serviceWorker.controller);
  } else {
    navigator.serviceWorker.ready.then((reg) => { if (reg.active) send(reg.active); });
  }
};

export const initNotifications = async (
  language: Language = "no",
  times: [number, number] = [16, 19]
): Promise<boolean> => {
  cancelNotifications();
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "denied") return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return false;

  const texts = notificationTexts[language] ?? notificationTexts.no;
  scheduleToday(times[0], "Stjernejobb ⭐", texts[0]);
  scheduleToday(times[1], "Stjernejobb ⭐", texts[1]);
  notifyServiceWorker(language, times);
  return true;
};

export const notificationsSupported = () => typeof Notification !== "undefined";
export const notificationsGranted = () =>
  typeof Notification !== "undefined" && Notification.permission === "granted";

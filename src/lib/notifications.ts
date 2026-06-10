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

const scheduleToday = (hour: number, title: string, body: string) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
  const ms = target.getTime() - now.getTime();
  if (ms > 0) {
    setTimeout(() => {
      new Notification(title, { body, icon: ICON, tag: `stjernejobb-${hour}` });
    }, ms);
  }
};

export const initNotifications = async (
  language: Language = "no",
  times: [number, number] = [16, 19]
): Promise<boolean> => {
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
  return true;
};

export const notificationsSupported = () => typeof Notification !== "undefined";
export const notificationsGranted = () =>
  typeof Notification !== "undefined" && Notification.permission === "granted";

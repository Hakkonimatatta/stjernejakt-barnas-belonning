const ICON = "/icon-180.png";

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

export const initNotifications = async (): Promise<boolean> => {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "denied") return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return false;

  scheduleToday(16, "Stjernejobb ⭐", "Hva skjer i dag? Gjør ett oppdrag!");
  scheduleToday(19, "Stjernejobb ⭐", "Tid for kveldsoppdrag?");
  return true;
};

export const notificationsSupported = () => typeof Notification !== "undefined";
export const notificationsGranted = () => typeof Notification !== "undefined" && Notification.permission === "granted";

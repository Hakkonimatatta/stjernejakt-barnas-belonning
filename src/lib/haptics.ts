import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType } from "@capacitor/haptics";

// Short "success" vibration in the iOS/Android app. Does nothing on the web.
export const vibrateSuccess = () => {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
};

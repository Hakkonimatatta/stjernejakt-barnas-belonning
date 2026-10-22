import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// In the iOS/Android app, WebView localStorage can be wiped by the OS (e.g. when
// the phone runs low on space). Since there is no backend, we keep a durable copy
// of the app's keys in native Preferences and restore it on startup if needed.
// On the web this is a no-op and localStorage is used directly.

const KEY_PREFIX = "stjernejakt_";
const isNative = Capacitor.isNativePlatform();

const mirror = (action: Promise<unknown>) => {
  action.catch((err) => console.warn("Failed to mirror to native storage:", err));
};

export const storageSet = (key: string, value: string) => {
  localStorage.setItem(key, value);
  if (isNative) mirror(Preferences.set({ key, value }));
};

export const storageRemove = (key: string) => {
  localStorage.removeItem(key);
  if (isNative) mirror(Preferences.remove({ key }));
};

// Must run before the app renders, since the rest of the app reads localStorage synchronously.
// localStorage wins when it has a value (it is always written first); Preferences only
// fills in keys that have gone missing.
export const restoreNativeStorage = async () => {
  if (!isNative) return;
  try {
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      if (!key.startsWith(KEY_PREFIX) || localStorage.getItem(key) !== null) continue;
      const { value } = await Preferences.get({ key });
      if (value !== null) localStorage.setItem(key, value);
    }

    // Copy anything only found in localStorage (e.g. data from before this update).
    const nativeKeys = new Set(keys);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX) || nativeKeys.has(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) await Preferences.set({ key, value });
    }
  } catch (err) {
    console.warn("Failed to restore native storage:", err);
  }
};

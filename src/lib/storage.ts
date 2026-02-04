import { AppData, Task, Reward, Child } from "@/types";
import { Language, loadLanguage } from "@/lib/i18n";

const STORAGE_KEY = "stjernejakt_data";

export const getDefaultTasks = (language: Language = loadLanguage()): Task[] =>
  language === "en"
    ? [
        { id: "1", name: "Clean your room", icon: "🧹", points: 5, completed: false },
        { id: "2", name: "Brush your teeth", icon: "🪥", points: 2, completed: false },
        { id: "3", name: "Play outside", icon: "⚽", points: 3, completed: false },
      ]
    : [
        { id: "1", name: "Rydd rommet", icon: "🧹", points: 5, completed: false },
        { id: "2", name: "Puss tennene", icon: "🪥", points: 2, completed: false },
        { id: "3", name: "Lek ute", icon: "⚽", points: 3, completed: false },
      ];

export const getDefaultRewards = (language: Language = loadLanguage()): Reward[] =>
  language === "en"
    ? [
        { id: "1", name: "Ice cream on Saturday", icon: "🍦", cost: 30, purchased: false },
        { id: "2", name: "10 extra minutes screen time", icon: "📱", cost: 10, purchased: false },
        { id: "3", name: "Family outing", icon: "🎠", cost: 100, purchased: false },
      ]
    : [
        { id: "1", name: "Is på lørdag", icon: "🍦", cost: 30, purchased: false },
        { id: "2", name: "10 min ekstra skjermtid", icon: "📱", cost: 10, purchased: false },
        { id: "3", name: "Familieutflukt", icon: "🎠", cost: 100, purchased: false },
      ];

const defaultData: AppData = {
  children: [],
  settings: {
    parentPin: "1234",
    enable24hReset: true,
  },
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toTaskArray = (value: unknown, fallback: Task[]): Task[] =>
  Array.isArray(value) ? (value as Task[]) : fallback;

const toRewardArray = (value: unknown, fallback: Reward[]): Reward[] =>
  Array.isArray(value) ? (value as Reward[]) : fallback;

const toChildArray = (value: unknown): Partial<Child>[] =>
  Array.isArray(value) ? (value as Partial<Child>[]) : [];

// Migrate old data structure to new structure
const migrateData = (data: Record<string, unknown>, language: Language): AppData => {
  const hasOldStructure = Array.isArray(data.tasks) && Array.isArray(data.rewards);
  const childrenRaw = toChildArray(data.children);

  if (hasOldStructure) {
    const tasks = toTaskArray(data.tasks, getDefaultTasks(language));
    const rewards = toRewardArray(data.rewards, getDefaultRewards(language));

    const migratedChildren = childrenRaw.map((child) => ({
      ...child,
      tasks: toTaskArray(child.tasks, tasks),
      rewards: toRewardArray(child.rewards, rewards),
      enable24hReset:
        typeof child.enable24hReset === "boolean"
          ? child.enable24hReset
          : (data.settings as AppData["settings"] | undefined)?.enable24hReset ?? true,
    })) as Child[];

    return {
      children: migratedChildren,
      settings: (data.settings as AppData["settings"]) ?? defaultData.settings,
    };
  }

  return {
    ...data,
    children: childrenRaw.map((child) => ({
      ...child,
      tasks: toTaskArray(child.tasks, getDefaultTasks(language)),
      rewards: toRewardArray(child.rewards, getDefaultRewards(language)),
      enable24hReset:
        typeof child.enable24hReset === "boolean"
          ? child.enable24hReset
          : (data.settings as AppData["settings"] | undefined)?.enable24hReset ?? true,
    })) as Child[],
  } as AppData;
};

function sanitizeData(input: unknown, language: Language): AppData {
  try {
    if (!isObject(input)) return defaultData;
    const migrated = migrateData(input, language);
    const children = Array.isArray(migrated.children) ? migrated.children : defaultData.children;
    const settings =
      migrated.settings && typeof migrated.settings === "object"
        ? migrated.settings
        : defaultData.settings;
    return { children, settings } as AppData;
  } catch {
    return defaultData;
  }
}

export const loadData = (language?: Language): AppData => {
  const langToUse = language ?? loadLanguage();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return sanitizeData(JSON.parse(stored), langToUse);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
  return defaultData;
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

// Translation maps for default tasks and rewards
const taskTranslationMap: Record<string, { no: string; en: string }> = {
  "🧹": { no: "Rydd rommet", en: "Clean your room" },
  "🪥": { no: "Puss tennene", en: "Brush your teeth" },
  "⚽": { no: "Lek ute", en: "Play outside" },
};

const rewardTranslationMap: Record<string, { no: string; en: string }> = {
  "🍦": { no: "Is på lørdag", en: "Ice cream on Saturday" },
  "📱": { no: "10 min ekstra skjermtid", en: "10 extra minutes screen time" },
  "🎠": { no: "Familieutflukt", en: "Family outing" },
};

// Merge data from two devices - combines points and syncs tasks/rewards
export const mergeAppData = (localData: AppData, remoteData: AppData): AppData => {
  const mergedChildren = localData.children.map((localChild) => {
    const remoteChild = remoteData.children.find((c) => c.id === localChild.id);

    if (!remoteChild) return localChild;

    const taskMap = new Map<string, Task>();

    localChild.tasks.forEach((task) => {
      taskMap.set(task.id, task);
    });

    remoteChild.tasks.forEach((task) => {
      const existing = taskMap.get(task.id);
      if (existing) {
        taskMap.set(task.id, { ...existing, completed: existing.completed || task.completed });
      } else {
        taskMap.set(task.id, task);
      }
    });

    const rewardMap = new Map<string, Reward>();

    localChild.rewards.forEach((reward) => {
      rewardMap.set(reward.id, reward);
    });

    remoteChild.rewards.forEach((reward) => {
      const existing = rewardMap.get(reward.id);
      if (existing) {
        rewardMap.set(reward.id, { ...existing, purchased: existing.purchased || reward.purchased });
      } else {
        rewardMap.set(reward.id, reward);
      }
    });

    const mergedPoints = localChild.points + remoteChild.points;

    return {
      ...localChild,
      points: mergedPoints,
      tasks: Array.from(taskMap.values()),
      rewards: Array.from(rewardMap.values()),
    };
  });

  const localChildIds = new Set(localData.children.map((c) => c.id));
  remoteData.children.forEach((remoteChild) => {
    if (!localChildIds.has(remoteChild.id)) {
      mergedChildren.push(remoteChild);
    }
  });

  return {
    children: mergedChildren,
    settings: localData.settings,
  };
};

// Translate default tasks and rewards when language changes
export const translateDefaultItems = (data: AppData, targetLanguage: Language): AppData => {
  return {
    ...data,
    children: data.children.map((child) => ({
      ...child,
      tasks: child.tasks.map((task) => {
        const translation = taskTranslationMap[task.icon];
        if (translation) {
          if (task.name === translation.no || task.name === translation.en) {
            return { ...task, name: translation[targetLanguage] };
          }
        }
        return task;
      }),
      rewards: child.rewards.map((reward) => {
        const translation = rewardTranslationMap[reward.icon];
        if (translation) {
          if (reward.name === translation.no || reward.name === translation.en) {
            return { ...reward, name: translation[targetLanguage] };
          }
        }
        return reward;
      }),
    })),
  };
};
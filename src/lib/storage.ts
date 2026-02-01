import { AppData, Task, Reward } from "@/types";
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

// Migrate old data structure to new structure
const migrateData = (data: any, language: Language): AppData => {
  // If data has the old structure (tasks/rewards at root level)
  if (data.tasks && data.rewards && Array.isArray(data.tasks)) {
    const migratedChildren = data.children.map((child: any) => ({
      ...child,
      tasks: child.tasks || [...data.tasks],
      rewards: child.rewards || [...data.rewards],
    }));
    
    return {
      children: migratedChildren,
      settings: data.settings,
    };
  }
  
  // Already new structure or needs default tasks/rewards
  return {
    ...data,
    children: data.children.map((child: any) => ({
      ...child,
      tasks: child.tasks || getDefaultTasks(language),
      rewards: child.rewards || getDefaultRewards(language),
    })),
  };
};

function sanitizeData(input: unknown, language: Language): AppData {
  try {
    const d = input as Partial<AppData> | null | undefined;
    if (!d || typeof d !== "object") return defaultData;
    const migrated = migrateData(d, language);
    const children = Array.isArray(migrated.children) ? migrated.children : defaultData.children;
    const settings = migrated.settings && typeof migrated.settings === "object" ? migrated.settings : defaultData.settings;
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
    
    if (!remoteChild) {
      // Child only exists locally
      return localChild;
    }

    // Merge tasks - keep both, mark completed if either has it completed
    const taskMap = new Map<string, any>();
    
    localChild.tasks.forEach((task) => {
      taskMap.set(task.id, task);
    });
    
    remoteChild.tasks.forEach((task) => {
      const existing = taskMap.get(task.id);
      if (existing) {
        // If either device has it completed, mark as completed
        taskMap.set(task.id, { ...existing, completed: existing.completed || task.completed });
      } else {
        taskMap.set(task.id, task);
      }
    });

    // Merge rewards - keep both, mark purchased if either has it purchased
    const rewardMap = new Map<string, any>();
    
    localChild.rewards.forEach((reward) => {
      rewardMap.set(reward.id, reward);
    });
    
    remoteChild.rewards.forEach((reward) => {
      const existing = rewardMap.get(reward.id);
      if (existing) {
        // If either device has it purchased, mark as purchased
        rewardMap.set(reward.id, { ...existing, purchased: existing.purchased || reward.purchased });
      } else {
        rewardMap.set(reward.id, reward);
      }
    });

    // Merge points - add them together
    const mergedPoints = localChild.points + remoteChild.points;

    return {
      ...localChild,
      points: mergedPoints,
      tasks: Array.from(taskMap.values()),
      rewards: Array.from(rewardMap.values()),
    };
  });

  // Add any children that only exist in remote data
  const localChildIds = new Set(localData.children.map((c) => c.id));
  remoteData.children.forEach((remoteChild) => {
    if (!localChildIds.has(remoteChild.id)) {
      mergedChildren.push(remoteChild);
    }
  });

  return {
    children: mergedChildren,
    settings: localData.settings, // Keep local settings (PIN, etc)
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
          // Check if this task matches one of the default tasks in either language
          if (task.name === translation.no || task.name === translation.en) {
            return { ...task, name: translation[targetLanguage] };
          }
        }
        return task;
      }),
      rewards: child.rewards.map((reward) => {
        const translation = rewardTranslationMap[reward.icon];
        if (translation) {
          // Check if this reward matches one of the default rewards in either language
          if (reward.name === translation.no || reward.name === translation.en) {
            return { ...reward, name: translation[targetLanguage] };
          }
        }
        return reward;
      }),
    })),
  };
};


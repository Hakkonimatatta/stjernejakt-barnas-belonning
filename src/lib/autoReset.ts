import { AppData } from "@/types";

const RESET_24H_MS = 24 * 60 * 60 * 1000;

export const autoResetExpiredItems = (data: AppData): AppData => {
  const now = Date.now();
  const enable24hReset = data.settings?.enable24hReset !== false;
  const taskResetTime = enable24hReset ? RESET_24H_MS : 0;
  const rewardResetTime = enable24hReset ? RESET_24H_MS : 0;
  let hasChanges = false;

  const children = data.children.map((child) => {
    let childChanged = false;

    const tasks = child.tasks.map((task) => {
      if (task.completed && task.completedAt) {
        const elapsed = now - task.completedAt;
        if (elapsed >= taskResetTime) {
          childChanged = true;
          hasChanges = true;
          return { ...task, completed: false, completedAt: undefined };
        }
      }
      return task;
    });

    const rewards = child.rewards.map((reward) => {
      if (reward.purchased && reward.purchasedAt) {
        const elapsed = now - reward.purchasedAt;
        if (elapsed >= rewardResetTime) {
          childChanged = true;
          hasChanges = true;
          return { ...reward, purchased: false, purchasedAt: undefined };
        }
      }
      return reward;
    });

    if (childChanged) {
      return { ...child, tasks, rewards };
    }
    return child;
  });

  if (hasChanges) {
    return { ...data, children };
  }

  return data;
};

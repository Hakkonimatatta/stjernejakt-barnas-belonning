import { AppData } from "@/types";

// Returns true if the timestamp was on a different calendar day than today
const isFromPreviousDay = (timestamp: number): boolean =>
  new Date(timestamp).toDateString() !== new Date().toDateString();

export const autoResetExpiredItems = (data: AppData): AppData => {
  let hasChanges = false;

  const children = data.children.map((child) => {
    let childChanged = false;
    const enable = child.enable24hReset !== false;

    if (!enable) return child;

    const tasks = child.tasks.map((task) => {
      if (task.completed && task.completedAt && isFromPreviousDay(task.completedAt)) {
        childChanged = true;
        hasChanges = true;
        return { ...task, completed: false, completedAt: undefined };
      }
      return task;
    });

    const rewards = child.rewards.map((reward) => {
      if (reward.purchased && reward.purchasedAt && isFromPreviousDay(reward.purchasedAt)) {
        childChanged = true;
        hasChanges = true;
        return { ...reward, purchased: false, purchasedAt: undefined };
      }
      return reward;
    });

    return childChanged ? { ...child, tasks, rewards } : child;
  });

  return hasChanges ? { ...data, children } : data;
};

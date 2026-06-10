import { AppData, Activity } from "@/types";

const isFromPreviousDay = (timestamp: number): boolean =>
  new Date(timestamp).toDateString() !== new Date().toDateString();

const ONE_WEEK_MS = 8 * 24 * 60 * 60 * 1000;

export const autoResetExpiredItems = (data: AppData): AppData => {
  let hasChanges = false;
  const now = Date.now();

  const children = data.children.map((child) => {
    let childChanged = false;
    const enable = child.enable24hReset !== false;

    const resetActivities: Activity[] = [];

    const tasks = enable
      ? child.tasks.map((task) => {
          if (task.completed && task.completedAt && isFromPreviousDay(task.completedAt)) {
            childChanged = true;
            hasChanges = true;
            resetActivities.push({
              id: `reset_${now}_${task.id}`,
              type: "reset",
              name: task.name,
              icon: task.icon,
              points: 0,
              timestamp: now,
            });
            return { ...task, completed: false, completedAt: undefined };
          }
          return task;
        })
      : child.tasks;

    const rewards = enable
      ? child.rewards.map((reward) => {
          if (reward.purchased && reward.purchasedAt && isFromPreviousDay(reward.purchasedAt)) {
            childChanged = true;
            hasChanges = true;
            return { ...reward, purchased: false, purchasedAt: undefined };
          }
          return reward;
        })
      : child.rewards;

    // Prune activities older than 8 days
    const pruned = (child.activities ?? []).filter((a) => now - a.timestamp <= ONE_WEEK_MS);
    const activitiesPruned = pruned.length !== (child.activities ?? []).length;

    if (!childChanged && !activitiesPruned) return child;
    hasChanges = true;

    const activities = [...pruned, ...resetActivities];
    return { ...child, tasks, rewards, activities };
  });

  return hasChanges ? { ...data, children } : data;
};

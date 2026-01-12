import { AppData } from "@/types";

const TASK_RESET_TIME = 0; // Umiddelbar reset for oppgaver
const REWARD_RESET_TIME = 1500; // 1.5 sekunder for belønninger

export const autoResetExpiredItems = (data: AppData): AppData => {
  const now = Date.now();
  let hasChanges = false;

  const children = data.children.map((child) => {
    let childChanged = false;

    const tasks = child.tasks.map((task) => {
      if (task.completed && task.completedAt) {
        const elapsed = now - task.completedAt;
        if (elapsed >= TASK_RESET_TIME) {
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
        if (elapsed >= REWARD_RESET_TIME) {
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

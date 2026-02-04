export interface Activity {
  id: string;
  type: "task" | "reward"; // 'task' = task completed, 'reward' = reward purchased
  name: string;
  icon: string;
  points: number;
  timestamp: number;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  points: number;
  tasks: Task[];
  rewards: Reward[];
  activities?: Activity[]; // Activity log
  bonusLastAwardedAt?: number; // Timestamp for 24h bonus tracking
  enable24hReset?: boolean; // Per-child 24h reset toggle
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  points: number;
  completed: boolean;
  completedAt?: number; // Timestamp for auto-reset
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  purchased: boolean;
  purchasedAt?: number; // Timestamp for auto-reset
}

export interface AppData {
  children: Child[];
  settings?: {
    parentPin: string;
    requirePinForPurchase?: boolean;
    enable24hReset?: boolean;
  };
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  points: number;
  tasks: Task[];
  rewards: Reward[];
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
  };
}

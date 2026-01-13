
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  isCore?: boolean;
  slot?: number; // 1, 2, or 3 for priority slots
}

export interface FocusSession {
  id: string;
  startTime: number;
  durationMinutes: number;
  energyScore: number; // 1-5 评分
  type: 'pomodoro' | 'short-break' | 'long-break';
  date: string;
  timeLabel: string; // HH:mm
}

export interface Goal {
  id: string;
  title: string;
  category: '工作' | '学习' | '生活' | '财务' | '信仰' | '关系' | '服务' | '其他';
  progress: number;
  isExpanded?: boolean;
}

export interface Reflection {
  id: string;
  date: string;
  content: string;
}

export interface AppState {
  profile: {
    name: string;
    avatar: string;
  };
  mission: string;
  vision: string;
  weeklyGoals: { id: string; title: string; completed: boolean }[];
  annualGoals: Goal[];
  reflections: Reflection[];
  settings: {
    pomodoroMinutes: number;
    maxMinutes: number;
    soundEnabled: boolean;
    soundType: 'digital' | 'bell' | 'nature';
    vibrationEnabled: boolean;
    darkMode: boolean;
  };
}

export type AppView = 'today' | 'weekly' | 'stats' | 'goals' | 'settings' | 'pomodoro';

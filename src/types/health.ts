export type KidneyStage = 'prevention' | 'stage3' | 'stage5';

export interface User {
  email: string;
  mode: KidneyStage;
  isGuest: boolean;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  sleep: string;
  activity: string;
  bp: {
    systolic: number;
    diastolic: number;
  };
  completed: boolean;
}

export interface HealthPlan {
  id: string;
  prompt: string;
  intro: string;
  shoppingItems: string[];
  days: DayPlan[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface JourneyItem {
  id: string;
  prompt: string;
  createdAt: string;
}

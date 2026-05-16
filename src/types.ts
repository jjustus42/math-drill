export type Operation = 'add' | 'sub' | 'mul' | 'div';

export type DifficultyLevel = 1 | 2 | 3 | 4;

export type AchievementType = 
  | 'first-session' 
  | '7-day-streak' 
  | '30-day-streak'
  | 'perfect-score'
  | 'level-up-add'
  | 'level-up-sub'
  | 'level-up-mul'
  | 'level-up-div';

export interface Achievement {
  id: string;
  type: AchievementType;
  earnedAt: number; // timestamp
}

export interface ProfileSettings {
  problemsPerSession: 5 | 10 | 20;
  includedOperations: Operation[];
}

export interface StudentProfile {
  name: string;
  avatar: string; // URL or name
  difficultyLevels: Record<Operation, DifficultyLevel>;
  settings: ProfileSettings;
  lastSessionDate?: number; // timestamp of last session day for streak tracking
}

export interface Problem {
  operation: Operation;
  operand1: number;
  operand2: number;
  answer: number;
}

export interface Attempt {
  problem: Problem;
  userAnswer: number;
  correct: boolean;
}

export interface Session {
  timestamp: number;
  attempts: Attempt[];
  timeTaken: number; // in seconds
  operations: Operation[];
}

export type Screen = 'home' | 'profile-create' | 'drill' | 'summary' | 'dashboard' | 'settings' | 'privacy';
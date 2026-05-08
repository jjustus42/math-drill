import type { Operation, DifficultyLevel, Problem, StudentProfile, Session, Attempt, ProfileSettings } from './types';

const DEFAULT_SETTINGS: ProfileSettings = {
  problemsPerSession: 10,
  includedOperations: ['add', 'sub', 'mul', 'div'],
};

export function generateProblem(operation: Operation, level: DifficultyLevel): Problem {
  let operand1: number, operand2: number, answer: number;

  const getRange = (level: DifficultyLevel): [number, number] => {
    switch (level) {
      case 1: return [0, 9];
      case 2: return [0, 99];
      case 3: return [10, 99];
      case 4: return [100, 999];
      default: return [0, 9];
    }
  };

  const [min, max] = getRange(level);

  switch (operation) {
    case 'add':
      operand1 = Math.floor(Math.random() * (max - min + 1)) + min;
      operand2 = Math.floor(Math.random() * (max - min + 1)) + min;
      answer = operand1 + operand2;
      break;
    case 'sub':
      operand1 = Math.floor(Math.random() * (max - min + 1)) + min;
      operand2 = Math.floor(Math.random() * (max - min + 1)) + min;
      if (operand1 < operand2) [operand1, operand2] = [operand2, operand1];
      answer = operand1 - operand2;
      break;
    case 'mul':
      operand1 = Math.floor(Math.random() * (max - min + 1)) + min;
      operand2 = Math.floor(Math.random() * (max - min + 1)) + min;
      answer = operand1 * operand2;
      break;
    case 'div':
      // Generate from answer outward
      answer = Math.floor(Math.random() * (max - min + 1)) + min;
      operand2 = Math.floor(Math.random() * 9) + 1; // divisor 1-9 to keep simple
      operand1 = answer * operand2;
      break;
  }

  return { operation, operand1, operand2, answer };
}

export function getOperationSymbol(op: Operation): string {
  switch (op) {
    case 'add': return '+';
    case 'sub': return '−';
    case 'mul': return '×';
    case 'div': return '÷';
  }
}

// Local storage keys
const PROFILE_KEY = 'math-drill-profile';
const SESSIONS_KEY = 'math-drill-sessions';

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): StudentProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  if (!data) return null;
  const parsed = JSON.parse(data) as StudentProfile;
  return {
    ...parsed,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    },
  };
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function clearSessions(): void {
  localStorage.removeItem(SESSIONS_KEY);
}

export function loadSessions(): Session[] {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function generateSessionHistoryCsv(sessions: Session[]): string {
  const headers = [
    'sessionTimestamp',
    'timeTakenSeconds',
    'operation',
    'operand1',
    'operand2',
    'correctAnswer',
    'userAnswer',
    'correct',
  ];

  const rows = sessions.flatMap((session) =>
    session.attempts.map((attempt) => [
      new Date(session.timestamp).toISOString(),
      session.timeTaken.toString(),
      attempt.problem.operation,
      attempt.problem.operand1.toString(),
      attempt.problem.operand2.toString(),
      attempt.problem.answer.toString(),
      attempt.userAnswer.toString(),
      attempt.correct ? 'true' : 'false',
    ])
  );

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getRecentAttempts(sessions: Session[], operation: Operation, n: number = 20): Attempt[] {
  const attempts: Attempt[] = [];
  for (let i = sessions.length - 1; i >= 0 && attempts.length < n; i--) {
    const session = sessions[i];
    for (let j = session.attempts.length - 1; j >= 0 && attempts.length < n; j--) {
      const attempt = session.attempts[j];
      if (attempt.problem.operation === operation) {
        attempts.push(attempt);
      }
    }
  }
  return attempts;
}

export function calculateAccuracy(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter(a => a.correct).length;
  return correct / attempts.length;
}

export function adjustDifficultyLevels(
  currentLevels: Record<Operation, DifficultyLevel>,
  sessions: Session[]
): { newLevels: Record<Operation, DifficultyLevel>; increasedOps: Operation[] } {
  const newLevels = { ...currentLevels };
  const increasedOps: Operation[] = [];
  const operations: Operation[] = ['add', 'sub', 'mul', 'div'];

  operations.forEach(op => {
    const attempts = getRecentAttempts(sessions, op);
    const accuracy = calculateAccuracy(attempts);
    if (attempts.length >= 5) { // Only adjust if we have enough data
      if (accuracy > 0.85 && newLevels[op] < 4) {
        newLevels[op]++;
        increasedOps.push(op);
      } else if (accuracy < 0.5 && newLevels[op] > 1) {
        newLevels[op]--;
      }
    }
  });

  return { newLevels, increasedOps };
}

export function generateWeightedProblems(
  operations: Operation[],
  profile: StudentProfile,
  sessions: Session[],
  numProblems: number
): Problem[] {
  if (operations.length === 0) return [];

  // Calculate error rates (1 - accuracy) for weighting
  const errorRates: Record<Operation, number> = { add: 0, sub: 0, mul: 0, div: 0 };
  operations.forEach(op => {
    const attempts = getRecentAttempts(sessions, op, 20);
    const accuracy = calculateAccuracy(attempts);
    errorRates[op] = 1 - accuracy;
  });

  // Normalize error rates to weights (higher error rate = higher weight)
  const totalError = Object.values(errorRates).reduce((sum, rate) => sum + rate, 0);
  const weights: Record<Operation, number> = { add: 0, sub: 0, mul: 0, div: 0 };
  if (totalError === 0) {
    // If no errors, equal weights
    operations.forEach(op => weights[op] = 1 / operations.length);
  } else {
    operations.forEach(op => weights[op] = errorRates[op] / totalError);
  }

  // Generate problems based on weights
  const problems: Problem[] = [];
  for (let i = 0; i < numProblems; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let selectedOp: Operation = operations[0];
    for (const op of operations) {
      cumulative += weights[op];
      if (rand <= cumulative) {
        selectedOp = op;
        break;
      }
    }
    const level = profile.difficultyLevels[selectedOp];
    problems.push(generateProblem(selectedOp, level));
  }

  return problems;
}

// Gamification: XP and Levels
const XP_PER_LEVEL = 100;
const MIN_XP_FOR_SESSION = 10; // minimum XP even for 0% score

export function calculateXpGain(scorePercentage: number, numProblems: number): number {
  // Base XP scaled by percentage, minimum of MIN_XP_FOR_SESSION
  const baseXp = MIN_XP_FOR_SESSION + Math.ceil((scorePercentage / 100) * (numProblems * 2));
  return Math.max(MIN_XP_FOR_SESSION, baseXp);
}

export function calculateLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

export function getXpProgress(xp: number): { currentLevel: number; xpInLevel: number; xpForLevel: number } {
  const currentLevel = calculateLevelFromXp(xp);
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpInLevel = xp - xpForCurrentLevel;
  const xpForLevel = XP_PER_LEVEL;
  return { currentLevel, xpInLevel, xpForLevel };
}

export function calculateDailyStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let streak = 0;
  let currentDate = todayMs;

  // Check sessions from most recent backwards
  for (let i = sessions.length - 1; i >= 0; i--) {
    const sessionDate = new Date(sessions[i].timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    const sessionDateMs = sessionDate.getTime();

    if (sessionDateMs === currentDate) {
      // Session on this day
      streak++;
      currentDate -= 24 * 60 * 60 * 1000; // Move to previous day
    } else if (sessionDateMs < currentDate) {
      // Gap found, break the streak
      break;
    }
  }

  return streak;
}

import type { Achievement, AchievementType } from './types';

const DEFAULT_DIFFICULTY_LEVELS: Record<Operation, DifficultyLevel> = {
  add: 1,
  sub: 1,
  mul: 1,
  div: 1,
};

export function deriveAchievementsFromSessions(sessions: Session[]): Achievement[] {
  const achievements: Achievement[] = [];
  const earnedOneTime = new Set<AchievementType>();
  let currentLevels = { ...DEFAULT_DIFFICULTY_LEVELS };
  let previousSessionDateMs: number | null = null;
  let currentStreak = 0;

  const ordered = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  ordered.forEach((session, index) => {
    const totalSessions = index + 1;
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    const sessionDateMs = sessionDate.getTime();

    if (previousSessionDateMs === null) {
      currentStreak = 1;
    } else if (sessionDateMs === previousSessionDateMs) {
      // Multiple sessions same day do not change streak count.
    } else if (sessionDateMs === previousSessionDateMs + 24 * 60 * 60 * 1000) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    previousSessionDateMs = sessionDateMs;

    const sessionTimestamp = session.timestamp;
    const correctCount = session.attempts.filter(a => a.correct).length;
    const isPerfectScore = session.attempts.length > 0 && correctCount === session.attempts.length;

    if (totalSessions === 1 && !earnedOneTime.has('first-session')) {
      earnedOneTime.add('first-session');
      achievements.push({
        id: `first-session-${sessionTimestamp}`,
        type: 'first-session',
        earnedAt: sessionTimestamp,
      });
    }

    if (currentStreak === 7 && !earnedOneTime.has('7-day-streak')) {
      earnedOneTime.add('7-day-streak');
      achievements.push({
        id: `7-day-streak-${sessionTimestamp}`,
        type: '7-day-streak',
        earnedAt: sessionTimestamp,
      });
    }

    if (currentStreak === 30 && !earnedOneTime.has('30-day-streak')) {
      earnedOneTime.add('30-day-streak');
      achievements.push({
        id: `30-day-streak-${sessionTimestamp}`,
        type: '30-day-streak',
        earnedAt: sessionTimestamp,
      });
    }

    if (isPerfectScore) {
      achievements.push({
        id: `perfect-score-${sessionTimestamp}`,
        type: 'perfect-score',
        earnedAt: sessionTimestamp,
      });
    }

    const { newLevels, increasedOps } = adjustDifficultyLevels(currentLevels, ordered.slice(0, totalSessions));
    increasedOps.forEach(op => {
      const achievementType = `level-up-${op}` as AchievementType;
      achievements.push({
        id: `${achievementType}-${sessionTimestamp}`,
        type: achievementType,
        earnedAt: sessionTimestamp,
      });
    });
    currentLevels = newLevels;
  });

  return achievements;
}

export function getXpProgressFromSessions(sessions: Session[]): { totalXp: number; currentLevel: number; xpInLevel: number; xpForLevel: number; xpToNextLevel: number } {
  const totalXp = sessions.reduce((total, session) => {
    const correctCount = session.attempts.filter(a => a.correct).length;
    const scorePercentage = session.attempts.length > 0 ? (correctCount / session.attempts.length) * 100 : 0;
    return total + calculateXpGain(scorePercentage, session.attempts.length);
  }, 0);

  const currentLevel = calculateLevelFromXp(totalXp);
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpToNextLevel = XP_PER_LEVEL - xpInLevel;

  return {
    totalXp,
    currentLevel,
    xpInLevel,
    xpForLevel: XP_PER_LEVEL,
    xpToNextLevel,
  };
}

export function getAchievementDescription(type: AchievementType): { title: string; description: string; emoji: string } {
  const descriptions: Record<AchievementType, { title: string; description: string; emoji: string }> = {
    'first-session': {
      title: 'First Session',
      description: 'Completed your first math drill session',
      emoji: '🎉',
    },
    '7-day-streak': {
      title: '7-Day Streak',
      description: 'Completed sessions on 7 consecutive days',
      emoji: '🔥',
    },
    '30-day-streak': {
      title: '30-Day Streak',
      description: 'Completed sessions on 30 consecutive days',
      emoji: '⭐',
    },
    'perfect-score': {
      title: 'Perfect Score',
      description: 'Answered all problems correctly in a session',
      emoji: '💯',
    },
    'level-up-add': {
      title: 'Addition Level Up',
      description: 'Mastered a difficulty level in addition',
      emoji: '➕',
    },
    'level-up-sub': {
      title: 'Subtraction Level Up',
      description: 'Mastered a difficulty level in subtraction',
      emoji: '➖',
    },
    'level-up-mul': {
      title: 'Multiplication Level Up',
      description: 'Mastered a difficulty level in multiplication',
      emoji: '✖️',
    },
    'level-up-div': {
      title: 'Division Level Up',
      description: 'Mastered a difficulty level in division',
      emoji: '➗',
    },
  };
  return descriptions[type];
}

// Dashboard utility functions
export function getSessionsInTimeRange(sessions: Session[], days: number): Session[] {
  if (days === 0) return sessions; // All time

  const now = Date.now();
  const cutoff = now - (days * 24 * 60 * 60 * 1000);
  return sessions.filter(session => session.timestamp >= cutoff);
}

export function getAccuracyByOperation(sessions: Session[]): Record<Operation, number> {
  const accuracies: Record<Operation, number> = { add: 0, sub: 0, mul: 0, div: 0 };

  ['add', 'sub', 'mul', 'div'].forEach(op => {
    const attempts = sessions.flatMap(s => s.attempts.filter(a => a.problem.operation === op));
    accuracies[op as Operation] = attempts.length > 0 ? calculateAccuracy(attempts) : 0;
  });

  return accuracies;
}

export function getSessionScoresOverTime(sessions: Session[]): Array<{ date: string; score: number }> {
  const sortedSessions = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  return sortedSessions.map(session => {
    const correctCount = session.attempts.filter(a => a.correct).length;
    const score = session.attempts.length > 0 ? (correctCount / session.attempts.length) * 100 : 0;
    const date = new Date(session.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD format
    return { date, score };
  });
}

export function getWeakestOperation(sessions: Session[]): Operation | null {
  if (sessions.length === 0) return null;

  const accuracies = getAccuracyByOperation(sessions);
  let weakestOp: Operation | null = null;
  let lowestAccuracy = 1;

  Object.entries(accuracies).forEach(([op, accuracy]) => {
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakestOp = op as Operation;
    }
  });

  return weakestOp;
}
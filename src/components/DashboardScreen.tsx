import { useState } from 'react';
import type { StudentProfile, Session, Operation, DifficultyLevel } from '../types';
import {
  deriveAchievementsFromSessions,
  getOperationSymbol,
  getAchievementDescription,
  getSessionsInTimeRange,
  getAccuracyByOperation,
  getSessionScoresOverTime,
  calculateDailyStreak,
} from '../utils';

interface DashboardScreenProps {
  profile: StudentProfile | null;
  sessions: Session[];
}

export default function DashboardScreen({ profile, sessions }: DashboardScreenProps) {
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  if (!profile) return <div>No profile found.</div>;

  const entries = Object.entries(profile.difficultyLevels) as Array<[Operation, DifficultyLevel]>;
  const allAchievements = deriveAchievementsFromSessions(sessions);
  const sortedAchievements = allAchievements.sort((a, b) => b.earnedAt - a.earnedAt);
  const recentAchievements = sortedAchievements.slice(0, 6);

  const getAccuracy = (op: Operation) => {
    const relevantAttempts = sessions.flatMap((s) => s.attempts.filter((a) => a.problem.operation === op));
    if (relevantAttempts.length === 0) return 0;
    const correct = relevantAttempts.filter((a) => a.correct).length;
    return Math.round((correct / relevantAttempts.length) * 100);
  };

  // Calculate accuracies for different time periods
  const sessions7Days = getSessionsInTimeRange(sessions, 7);
  const sessions30Days = getSessionsInTimeRange(sessions, 30);
  const accuracies7Days = getAccuracyByOperation(sessions7Days);
  const accuracies30Days = getAccuracyByOperation(sessions30Days);
  const accuraciesAllTime = getAccuracyByOperation(sessions);

  // Get session scores for chart
  const sessionScores = getSessionScoresOverTime(sessions);

  // Get daily streak
  const dailyStreak = calculateDailyStreak(sessions);

  return (
    <div className="dashboard-screen">
      <h1>Progress Dashboard</h1>

      <div className="dashboard-section">
        <h2>Current Difficulty Levels</h2>
        <ul className="difficulty-list">
          {entries.map(([op, level]) => (
            <li key={op}>
              {getOperationSymbol(op)}: Level {level} (Overall Accuracy: {getAccuracy(op)}%)
            </li>
          ))}
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Accuracy by Time Period</h2>
        <div className="accuracy-table">
          <table>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Last 7 Days</th>
              <th>Last 30 Days</th>
              <th>All Time</th>
            </tr>
          </thead>
          <tbody>
            {(['add', 'sub', 'mul', 'div'] as Operation[]).map(op => (
              <tr key={op}>
                <td>{getOperationSymbol(op)}</td>
                <td>{sessions7Days.length > 0 ? Math.round(accuracies7Days[op] * 100) : '—'}%</td>
                <td>{sessions30Days.length > 0 ? Math.round(accuracies30Days[op] * 100) : '—'}%</td>
                <td>{Math.round(accuraciesAllTime[op] * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <div className="dashboard-section">
        <h2>Session Statistics</h2>
        <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{dailyStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {sessions.length > 0 ? Math.round(sessionScores.reduce((sum, s) => sum + s.score, 0) / sessionScores.length) : 0}%
          </div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>
      </div>

      <div className="dashboard-section">
        <h2>Session Scores Over Time</h2>
        {sessionScores.length > 0 ? (
          <div className="score-chart">
          {sessionScores.slice(-10).map((score, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-label">{score.date}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${score.score}%` }}
                  title={`${Math.round(score.score)}%`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
          <p>No sessions completed yet.</p>
        )}
      </div>
      
      <div className="dashboard-section">
        <h2>Achievements</h2>
        {allAchievements.length === 0 ? (
          <p>No achievements yet. Keep practicing!</p>
        ) : (
        <>
          <div className="achievements-grid recent">
            {recentAchievements.map((achievement) => {
              const desc = getAchievementDescription(achievement.type);
              return (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-emoji">{desc.emoji}</div>
                  <div className="achievement-name">{desc.title}</div>
                  <div className="achievement-description">{desc.description}</div>
                </div>
              );
            })}
          </div>
          {allAchievements.length > 6 && (
            <div className="view-more-container">
              <button onClick={() => setShowAllAchievements(!showAllAchievements)}>
                {showAllAchievements ? 'Show Less' : 'View More'}
              </button>
            </div>
          )}
          {showAllAchievements && allAchievements.length > 6 && (
            <div className="achievements-grid all">
              {sortedAchievements.slice(6).map((achievement) => {
                const desc = getAchievementDescription(achievement.type);
                return (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-emoji">{desc.emoji}</div>
                    <div className="achievement-name">{desc.title}</div>
                    <div className="achievement-description">{desc.description}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

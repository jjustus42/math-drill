import { useState } from 'react';
import type { StudentProfile, Session, Operation, DifficultyLevel } from '../types';
import { getOperationSymbol, generateSessionHistoryCsv, downloadCsv } from '../utils';

interface SettingsScreenProps {
  profile: StudentProfile | null;
  sessions: Session[];
  updateProfile: (profile: StudentProfile) => void;
  clearProfileData: () => void;
}

const operations: Operation[] = ['add', 'sub', 'mul', 'div'];
const difficultyLabels: Record<DifficultyLevel, string> = {
  1: 'Beginner',
  2: 'Developing',
  3: 'Proficient',
  4: 'Advanced',
};

const operationLabels: Record<Operation, string> = {
  add: 'Addition',
  sub: 'Subtraction',
  mul: 'Multiplication',
  div: 'Division',
};

export default function SettingsScreen({ profile, sessions, updateProfile, clearProfileData }: SettingsScreenProps) {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar ?? '🐶');

  if (!profile) {
    return <div>No profile found.</div>;
  }

  const handleProblemsPerSession = (value: 5 | 10 | 20) => {
    const updated = {
      ...profile,
      settings: {
        ...profile.settings,
        problemsPerSession: value,
      },
    };
    updateProfile(updated);
  };

  const handleProfileSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const updatedProfile = {
      ...profile,
      name: trimmedName,
      avatar: selectedAvatar,
    };
    updateProfile(updatedProfile);
  };

  const handleToggleOperation = (operation: Operation) => {
    const current = profile.settings.includedOperations;
    const isSelected = current.includes(operation);
    if (isSelected && current.length === 1) return;

    const updatedOperations = isSelected 
      ? current.filter((op) => op !== operation)
      : [...current, operation];

    const updated = {
      ...profile,
      settings: {
        ...profile.settings,
        includedOperations: updatedOperations,
      },
    };
    updateProfile(updated);
  };

  const handleDifficultyChange = (operation: Operation, level: DifficultyLevel) => {
    const updated = {
      ...profile,
      difficultyLevels: {
        ...profile.difficultyLevels,
        [operation]: level,
      },
    };
    updateProfile(updated);
  };

  const handleExport = () => {
    const csv = generateSessionHistoryCsv(sessions);
    downloadCsv(csv, 'math-drill-session-history.csv');
  };

  const canExport = sessions.length > 0;
  const { settings } = profile;

  return (
    <div className="settings-screen">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>Student Profile</h2>
        <label className="field-label">
          Student Name:
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter student name"
          />
        </label>
        <div className="field-label">
          Choose Avatar:
          <div className="avatar-selection" role="group" aria-label="Avatar selection">
            {['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'].map((avatar) => (
              <button
                key={avatar}
                type="button"
                className={selectedAvatar === avatar ? 'selected' : ''}
                onClick={() => setSelectedAvatar(avatar)}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
        <button className="primary-button" onClick={handleProfileSave} disabled={!name.trim()}>
          Save Profile
        </button>
      </div>

      <div className="settings-section">
        <h2>Session Size</h2>
        <div className="radio-group">
          {[5, 10, 20].map((count) => (
            <label key={count}>
              <input
                type="radio"
                name="problemsPerSession"
                checked={settings.problemsPerSession === count}
                onChange={() => handleProblemsPerSession(count as 5 | 10 | 20)}
              />
              {count} problems per session
            </label>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Included Operations</h2>
        <div className="operation-toggle-group">
          {operations.map((operation) => (
            <label key={operation}>
              <input
                type="checkbox"
                checked={settings.includedOperations.includes(operation)}
                onChange={() => handleToggleOperation(operation)}
              />
              {getOperationSymbol(operation)} {operationLabels[operation]}
            </label>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Manual Difficulty Overrides</h2>
        <div className="difficulty-grid">
          {operations.map((operation) => (
            <label key={operation} className="difficulty-row">
              <span>{getOperationSymbol(operation)}</span>
              <select
                value={profile.difficultyLevels[operation]}
                onChange={(event) => handleDifficultyChange(operation, Number(event.target.value) as DifficultyLevel)}
              >
                {[1, 2, 3, 4].map((level) => (
                  <option key={level} value={level}>
                    Level {level} — {difficultyLabels[level as DifficultyLevel]}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Data Management</h2>
        <button
          className={canExport ? 'primary-button' : undefined}
          onClick={handleExport}
          disabled={!canExport}
        >
          Export Session History as CSV
        </button>
        {!canExport && <p className="info">Complete at least one session before exporting history.</p>}
        {!showClearConfirmation ? (
          <button className="danger" onClick={() => setShowClearConfirmation(true)}>
            Clear all stored profile data
          </button>
        ) : (
          <div className="confirmation-dialog">
            <p>Are you sure you want to clear all profile data? This will reset your name, avatar, difficulty levels, and delete all session history. This action cannot be undone.</p>
            <button className="danger" onClick={() => { clearProfileData(); setShowClearConfirmation(false); }}>
              Yes, Clear All Data
            </button>
            <button onClick={() => setShowClearConfirmation(false)}>Cancel</button>
          </div>
        )}
      </div>

    </div>
  );
}

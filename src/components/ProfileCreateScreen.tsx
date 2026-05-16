import { useState, type FormEvent } from 'react';
import type { StudentProfile, Screen, Operation, DifficultyLevel } from '../types';

interface ProfileCreateScreenProps {
  setProfile: (profile: StudentProfile) => void;
  setScreen: (screen: Screen) => void;
}

const avatars = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const defaultDifficultyLevels: Record<Operation, DifficultyLevel> = { add: 1, sub: 1, mul: 1, div: 1 };
const defaultSettings = {
  problemsPerSession: 10 as const,
  includedOperations: ['add', 'sub', 'mul', 'div'] as Operation[],
};

const difficultyOptions = [
  {
    value: 1 as DifficultyLevel,
    label: 'Beginner',
    description: 'Single-digit operands',
    example: {
      add: '1+2',
      sub: '9-2',
      mul: '3×4',
      div: '6÷2',
    },
  },
  {
    value: 2 as DifficultyLevel,
    label: 'Developing',
    description: 'Mixed single/double-digit operands',
    example: {
      add: '7+13',
      sub: '15-8',
      mul: '4×12',
      div: '18÷3',
    },
  },
  {
    value: 3 as DifficultyLevel,
    label: 'Proficient',
    description: 'Double-digit operands',
    example: {
      add: '24+37',
      sub: '56-19',
      mul: '11×7',
      div: '84÷7',
    },
  },
  {
    value: 4 as DifficultyLevel,
    label: 'Advanced',
    description: 'Multi-digit operands',
    example: {
      add: '124+278',
      sub: '345-167',
      mul: '23×15',
      div: '144÷12',
    },
  },
];

export default function ProfileCreateScreen({ setProfile, setScreen }: ProfileCreateScreenProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [difficultyLevels, setDifficultyLevels] = useState<Record<Operation, DifficultyLevel>>(defaultDifficultyLevels);

  const handleDifficultyChange = (operation: Operation, value: DifficultyLevel) => {
    setDifficultyLevels((current) => ({
      ...current,
      [operation]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      const profile: StudentProfile = {
        name: trimmedName,
        avatar: selectedAvatar,
        difficultyLevels,
        settings: defaultSettings,
      };
      setProfile(profile);
      setScreen('home');
    }
  };

  return (
    <div className="profile-create-screen">
      <div className="profile-header">
        <div className="avatar-preview" aria-hidden="true">{selectedAvatar}</div>
        <div>
          <h1>Create Student Profile</h1>
          <p>
            Please enter a name and select an avatar for your student.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <label className="field-label">
          Student Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student name"
          />
        </label>

        <div className="field-label">
          Choose Avatar:
          <div className="avatar-selection" role="group" aria-label="Avatar selection">
            {avatars.map((avatar) => (
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

        <div className="difficulty-preview">
          <h2>Starting Difficulty</h2>
          <div className="difficulty-grid">
            {(['add', 'sub', 'mul', 'div'] as Operation[]).map((operation) => {
              const operationLabel = operation === 'add' ? 'Addition'
                : operation === 'sub' ? 'Subtraction'
                : operation === 'mul' ? 'Multiplication'
                : 'Division';
              const selectedOption = difficultyOptions.find((option) => option.value === difficultyLevels[operation]);

              return (
                <div key={operation} className="difficulty-item">
                  <label>
                    {operationLabel}:<span>&nbsp;&nbsp;</span>
                    <select
                      value={difficultyLevels[operation]}
                      onChange={(e) => handleDifficultyChange(operation, Number(e.target.value) as DifficultyLevel)}
                    >
                      {difficultyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedOption && (
                    <div className="difficulty-description">
                      {selectedOption.description}, <em>e.g.</em> {selectedOption.example[operation]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={!name.trim()} className={name.trim() ? 'create-profile-ready' : ''}>
          {name.trim() ? 'Create Profile' : 'Enter a name'}
        </button>
      </form>
    </div>
  );
}
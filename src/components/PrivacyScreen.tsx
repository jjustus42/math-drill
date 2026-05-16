import type { Screen } from '../types';

interface PrivacyScreenProps {
  setScreen: (screen: Screen) => void;
}

export default function PrivacyScreen({ setScreen }: PrivacyScreenProps) {
  return (
    <div className="privacy-screen">
      <h1>Privacy</h1>
      <p>We do not collect or store any of your personal data. All data is stored locally within your own Web browser.</p>
      <button onClick={() => setScreen('home')}>Back to Home</button>
    </div>
  );
}

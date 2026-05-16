import type { Screen } from '../types';

interface PrivacyScreenProps {
  setScreen: (screen: Screen) => void;
  showMainMenu: boolean;
}

export default function PrivacyScreen({ setScreen, showMainMenu }: PrivacyScreenProps) {
  return (
    <div className="privacy-screen">
      <h1>Privacy</h1>
      <p>We do not collect or store any of your personal data. All data is stored locally within your own Web browser.</p>
      {!showMainMenu && (
        <button onClick={() => setScreen('home')}>Back to Home</button>
      )}
    </div>
  );
}

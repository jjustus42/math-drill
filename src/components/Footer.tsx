import type { Screen } from '../types';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  currentScreen: Screen;
}

export default function Footer({ setScreen, currentScreen }: FooterProps) {
  if (currentScreen === 'privacy') {
    return null;
  }

  return (
    <footer className="footer">
      <button onClick={() => setScreen('privacy')} className="footer-link">
        Privacy
      </button>
    </footer>
  );
}

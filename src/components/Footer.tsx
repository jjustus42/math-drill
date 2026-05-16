import type { Screen } from '../types';

interface FooterProps {
  setScreen: (screen: Screen) => void;
}

export default function Footer({ setScreen }: FooterProps) {
  return (
    <footer className="footer">
      <button onClick={() => setScreen('privacy')} className="footer-link">
        Privacy
      </button>
    </footer>
  );
}

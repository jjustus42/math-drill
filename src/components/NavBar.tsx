import type { Screen } from '../types';

interface NavBarProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export default function NavBar({ currentScreen, setScreen }: NavBarProps) {
  const navItems = [
    { label: 'Home', screen: 'home' as Screen },
    { label: 'Progress', screen: 'dashboard' as Screen },
    { label: 'Settings', screen: 'settings' as Screen },
  ];

  return (
    <nav className="nav-bar">
      {navItems.map((item) => (
        <button
          key={item.screen}
          className={currentScreen === item.screen ? 'active' : ''}
          onClick={() => setScreen(item.screen)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
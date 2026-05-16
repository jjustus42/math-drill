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
    { label: 'Privacy', screen: 'privacy' as Screen },
  ];

  const handleNavClick = (screen: Screen) => {
    if (currentScreen === 'drill' && screen !== 'drill') {
      const leave = window.confirm('Leaving this drill will lose your current progress. Continue?');
      if (!leave) return;
    }

    setScreen(screen);
  };

  const isActive = (screen: Screen) =>
    screen === currentScreen || (currentScreen === 'summary' && screen === 'home');

  return (
    <nav className="nav-bar">
      {navItems.map((item) => (
        <button
          key={item.screen}
          className={isActive(item.screen) ? 'active' : ''}
          onClick={() => handleNavClick(item.screen)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
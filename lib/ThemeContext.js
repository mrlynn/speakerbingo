import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, getSeasonalTheme, themeList } from './themes';

const ThemeContext = createContext(null);

// Apply theme colors to CSS custom properties
function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const { colors, gradients, backgroundImage } = theme;

  // Apply color variables
  root.style.setProperty('--sunrise-rust', colors.rust);
  root.style.setProperty('--sunrise-rust-dark', colors.rustDark);
  root.style.setProperty('--sunrise-navy', colors.navy);
  root.style.setProperty('--sunrise-teal', colors.teal);
  root.style.setProperty('--sunrise-gold', colors.gold);
  root.style.setProperty('--sunrise-cream', colors.cream);
  root.style.setProperty('--sunrise-peach', colors.peach);
  root.style.setProperty('--sunrise-coral', colors.coral);
  root.style.setProperty('--sunrise-orange', colors.orange);
  root.style.setProperty('--sunrise-sky', colors.sky);
  root.style.setProperty('--sunrise-water', colors.water);

  // Apply gradient variables
  root.style.setProperty('--gradient-sunrise', gradients.sunrise);
  root.style.setProperty('--gradient-sky', gradients.sky);
  root.style.setProperty('--gradient-water', gradients.water);
  root.style.setProperty('--gradient-cream', gradients.cream);
  root.style.setProperty('--gradient-selected', gradients.selected);
  root.style.setProperty('--gradient-fab', gradients.fab);

  // Apply background image (or remove if none)
  if (backgroundImage) {
    root.style.setProperty('--theme-bg-image', `url(${backgroundImage})`);
    root.style.setProperty('--theme-bg-opacity', '1');
  } else {
    root.style.setProperty('--theme-bg-image', 'none');
    root.style.setProperty('--theme-bg-opacity', '0');
  }

  // Set data attribute for potential CSS selectors
  root.dataset.theme = theme.id;
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('sunrise');
  const [autoTheme, setAutoTheme] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bingo-theme');
    const savedAutoSetting = localStorage.getItem('bingo-theme-auto');

    // Default to auto-theme for first-time users (no saved preference)
    const isAutoEnabled = savedAutoSetting === null ? true : savedAutoSetting === 'true';

    setAutoTheme(isAutoEnabled);

    if (isAutoEnabled) {
      setThemeName(getSeasonalTheme());
    } else if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }

    setIsLoaded(true);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const theme = themes[themeName] || themes.sunrise;
    applyTheme(theme);

    // Save to localStorage
    if (!autoTheme) {
      localStorage.setItem('bingo-theme', themeName);
    }
  }, [themeName, isLoaded, autoTheme]);

  // Change theme manually
  const changeTheme = useCallback((newThemeName) => {
    if (themes[newThemeName]) {
      setAutoTheme(false);
      localStorage.setItem('bingo-theme-auto', 'false');
      setThemeName(newThemeName);
    }
  }, []);

  // Toggle auto-theme based on date
  const toggleAutoTheme = useCallback(() => {
    const newAuto = !autoTheme;
    setAutoTheme(newAuto);
    localStorage.setItem('bingo-theme-auto', String(newAuto));

    if (newAuto) {
      setThemeName(getSeasonalTheme());
    }
  }, [autoTheme]);

  // Get current theme object
  const currentTheme = themes[themeName] || themes.sunrise;

  const value = {
    themeName,
    theme: currentTheme,
    themes: themeList,
    autoTheme,
    changeTheme,
    toggleAutoTheme,
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { themeMode, setTheme, toggleTheme } = useThemeStore();
  return { themeMode, setTheme, toggleTheme };
}

import { create } from 'zustand';

type ThemeMode = 'LIGHT' | 'DARK';

interface ThemeStore {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'LIGHT',
  setTheme: (mode) => set({ themeMode: mode }),
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'LIGHT' ? 'DARK' : 'LIGHT',
    })),
}));

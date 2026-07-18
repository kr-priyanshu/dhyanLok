import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  bgColor: string;
  textColor: string;
  headingFont: string; 
  accentColor?: string;
  setTheme: (theme: Partial<Omit<ThemeState, 'setTheme'>>) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      bgColor: '#0a0a0a',
      textColor: '#ffffff',
      headingFont: 'var(--font-creamy)',
      accentColor: '', // defaults to textColor if not explicitly set
      setTheme: (theme) => set((state) => ({ ...state, ...theme })),
    }),
    {
      name: 'theme-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState as ThemeState;
      },
    }
  )
);

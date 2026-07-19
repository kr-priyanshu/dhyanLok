import { create } from 'zustand';

interface UIState {
  isUltraFocusClock: boolean;
  setIsUltraFocusClock: (val: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isUltraFocusClock: false,
  setIsUltraFocusClock: (val) => set({ isUltraFocusClock: val }),
  isCommandPaletteOpen: false,
  setIsCommandPaletteOpen: (val) => set({ isCommandPaletteOpen: val }),
}));

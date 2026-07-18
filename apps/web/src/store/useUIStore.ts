import { create } from 'zustand';

interface UIState {
  isUltraFocusClock: boolean;
  setIsUltraFocusClock: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isUltraFocusClock: false,
  setIsUltraFocusClock: (val) => set({ isUltraFocusClock: val }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  passkey: string | null;
  isLocked: boolean;
  googleClientId: string | null;
  setPasskey: (key: string | null) => void;
  unlock: (key: string) => boolean;
  lock: () => void;
  setGoogleClientId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      passkey: null,
      isLocked: false,
      googleClientId: "425063335581-2ubb3pr3lt6194r34nmbomcil3bio1h2.apps.googleusercontent.com",
      setPasskey: (key) => set({ passkey: key, isLocked: key ? true : false }),
      unlock: (key) => {
        const { passkey } = get();
        if (key === passkey) {
          set({ isLocked: false });
          return true;
        }
        return false;
      },
      lock: () => {
        const { passkey } = get();
        if (passkey) set({ isLocked: true });
      },
      setGoogleClientId: (id) => set({ googleClientId: id }),
    }),
    {
      name: 'auth-storage',
      // We want to lock the app every time it boots up if there's a passkey
      onRehydrateStorage: () => (state) => {
        if (state?.passkey) {
          state.isLocked = true;
        }
      },
    }
  )
);

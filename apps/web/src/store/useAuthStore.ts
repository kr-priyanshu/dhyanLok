import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  role: 'admin' | 'guest' | null;
  username: string | null;
  registeredEmail: string | null;
  isLoggedIn: boolean;
  passkey: string | null;
  googleClientId: string | null;
  geminiApiKey: string | null;
  // Hydration sentinel — NOT persisted. Starts false every page load,
  // flips to true once onRehydrateStorage fires and localStorage is read.
  hasHydrated: boolean;
  // Feature tour — IS persisted. Tracks if the user has seen the tour.
  hasCompletedTour: boolean;
  isVerified: boolean;

  setRole: (role: 'admin' | 'guest' | null) => void;
  setUsername: (name: string | null) => void;
  setRegisteredEmail: (email: string | null) => void;
  setIsLoggedIn: (val: boolean) => void;
  setPasskey: (key: string | null) => void;
  setGoogleClientId: (id: string | null) => void;
  setGeminiApiKey: (key: string | null) => void;
  setHasHydrated: (val: boolean) => void;
  setHasCompletedTour: (val: boolean) => void;
  setIsVerified: (val: boolean) => void;
  logout: () => void;
  wipeDevice: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      username: null,
      registeredEmail: null,
      isLoggedIn: false,
      passkey: null,
      googleClientId: null,
      geminiApiKey: null,
      // hasHydrated is always false on first render — set by onRehydrateStorage
      hasHydrated: false,
      hasCompletedTour: false,
      isVerified: false,

      setRole: (role) => set({ role }),
      setUsername: (name) => set({ username: name }),
      setRegisteredEmail: (email) => set({ registeredEmail: email }),
      setIsLoggedIn: (val) => set({ isLoggedIn: val }),
      setPasskey: (key) => set({ passkey: key }),
      setGoogleClientId: (id) => set({ googleClientId: id }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setHasHydrated: (val) => set({ hasHydrated: val }),
      setHasCompletedTour: (val) => set({ hasCompletedTour: val }),
      setIsVerified: (val) => set({ isVerified: val }),
      logout: () => set({ isLoggedIn: false, role: null, username: null }),
      wipeDevice: () => {
        // Clear all persisted stores from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('habit-storage');
          localStorage.removeItem('theme-storage');
        }
        set({
          role: null,
          username: null,
          registeredEmail: null,
          isLoggedIn: false,
          passkey: null,
          googleClientId: null,
          geminiApiKey: null,
          hasCompletedTour: false,
          isVerified: false,
        });
      }
    }),
    {
      name: 'auth-storage',
      version: 1,
      // Exclude hasHydrated from being persisted — it must always start as
      // false so the guard works correctly on every cold page load.
      partialize: (state) => ({
        role: state.role,
        username: state.username,
        registeredEmail: state.registeredEmail,
        isLoggedIn: state.isLoggedIn,
        passkey: state.passkey,
        googleClientId: state.googleClientId,
        geminiApiKey: state.geminiApiKey,
        hasCompletedTour: state.hasCompletedTour,
        isVerified: state.isVerified,
      }),
      // This callback fires once localStorage has been read and the store
      // has been fully rehydrated. We flip hasHydrated to true here so that
      // AuthGuard and onboarding know it's safe to check isLoggedIn.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState: any) => persistedState as AuthState,
    }
  )
);

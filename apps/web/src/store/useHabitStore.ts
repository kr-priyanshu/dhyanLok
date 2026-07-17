import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  _id: string;
  title: string;
  type: 'binary' | 'timer';
  targetTimeMinutes?: number;
  isActive: boolean;
  category?: string;
}

interface HabitState {
  habits: Habit[];
  logs: Record<string, string>; // "YYYY-MM-DD_habitId" -> status
  journals: Record<string, string>; // "YYYY-MM-DD" -> journal text
  audioFiles: Record<string, string>; // "YYYY-MM-DD" -> Google Drive File ID
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Omit<Habit, '_id'>) => void;
  removeHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string) => void;
  setJournal: (date: string, text: string) => void;
  setAudioFile: (date: string, fileId: string) => void;
  fetchHabits: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  optimisticComplete: (habitId: string, userId: string, date: string, timeSpent?: number) => Promise<void>;
  restoreData: (data: { habits: Habit[]; logs: Record<string, 'completed' | 'skipped'>; journals: Record<string, string> }) => void;
  reorderHabit: (habitId: string, sourceCategory: string, destinationCategory: string, sourceIndex: number, destinationIndex: number) => void;
}

const API_URL = 'http://localhost:4000/api';

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [
        { _id: "1", title: "Read 20 pages", type: "binary", isActive: true, category: "Learning" },
        { _id: "2", title: "Deep Work", type: "timer", targetTimeMinutes: 90, isActive: true, category: "Work" },
        { _id: "3", title: "Exercise", type: "binary", isActive: true, category: "Health" },
      ],
      logs: {},
      journals: {},
      audioFiles: {},
      setHabits: (habits) => set({ habits }),
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          _id: crypto.randomUUID(), 
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },
      removeHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h._id !== id),
        }));
      },
      toggleLog: (habitId, date) => {
        set((state) => {
          const key = `${date}_${habitId}`;
          const currentStatus = state.logs[key];
          const newLogs = { ...state.logs };
          if (currentStatus === 'completed') {
            delete newLogs[key];
          } else {
            newLogs[key] = 'completed';
          }
          return { logs: newLogs };
        });
      },
      setJournal: (date, text) => {
        set((state) => ({
          journals: { ...state.journals, [date]: text }
        }));
      },
      setAudioFile: (date, fileId) => {
        set((state) => ({
          audioFiles: { ...state.audioFiles, [date]: fileId }
        }));
      },
      fetchHabits: async () => {
        try {
          const res = await fetch(`${API_URL}/habits?userId=local`);
          if (res.ok) { /* Backend available — future sync point */ }
        } catch {
          // Backend unavailable, relying on local storage.
        }
      },
      fetchLogs: async () => {
        try {
          const res = await fetch(`${API_URL}/action-logs?userId=local`);
          if (res.ok) { /* Backend available — future sync point */ }
        } catch {
          // Backend unavailable, relying on local storage.
        }
      },
      optimisticComplete: async (habitId, userId, date, timeSpent) => {
        const key = `${date}_${habitId}`;
        set((state) => ({
          logs: { ...state.logs, [key]: 'completed' }
        }));
        
        try {
          const res = await fetch(`${API_URL}/action-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              habitId,
              date,
              status: 'completed',
              timeSpent
            }),
          });
          if (!res.ok) throw new Error('API failed');
        } catch {
          // Keep local state on error
        }
      },
      restoreData: (data) => {
        set({
          habits: data.habits || [],
          logs: data.logs || {},
          journals: data.journals || {},
          audioFiles: (data as any).audioFiles || {},
        });
      },
      reorderHabit: (habitId, sourceCategory, destinationCategory, sourceIndex, destinationIndex) => {
        set((state) => {
          const habits = [...state.habits];
          
          // Identify unique categories in order of appearance
          const categorySet = new Set<string>();
          habits.forEach(h => categorySet.add(h.category || 'General'));
          // Ensure source and destination categories exist in the set
          categorySet.add(sourceCategory);
          categorySet.add(destinationCategory);
          
          const categories = Array.from(categorySet);
          
          // Group habits
          const grouped: Record<string, Habit[]> = {};
          categories.forEach(c => grouped[c] = []);
          habits.forEach(h => {
            grouped[h.category || 'General'].push(h);
          });
          
          // Move item
          const [movedHabit] = grouped[sourceCategory].splice(sourceIndex, 1);
          if (!movedHabit) return state; // safety check
          
          movedHabit.category = destinationCategory === 'General' ? undefined : destinationCategory;
          grouped[destinationCategory].splice(destinationIndex, 0, movedHabit);
          
          // Flatten back
          const newHabits = categories.flatMap(c => grouped[c]);
          return { habits: newHabits };
        });
      },
    }),
    {
      name: 'habit-storage',
    }
  )
);

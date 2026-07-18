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

interface RestoreData {
  habits: Habit[];
  logs: Record<string, string>;
  journals: Record<string, string>;
  transcripts?: Record<string, string>;
  audioFiles?: Record<string, string>;
}

interface HabitState {
  habits: Habit[];
  logs: Record<string, string>; // "YYYY-MM-DD_habitId" -> status
  journals: Record<string, string>; // "YYYY-MM-DD" -> journal text
  transcripts: Record<string, string>; // "YYYY-MM-DD" -> dictated text
  audioFiles: Record<string, string>; // "YYYY-MM-DD" -> Google Drive File ID
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Omit<Habit, '_id'>) => void;
  removeHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string) => void;
  setJournal: (date: string, text: string) => void;
  setTranscript: (date: string, text: string) => void;
  setAudioFile: (date: string, fileId: string) => void;
  restoreData: (data: RestoreData) => void;
  reorderHabit: (habitId: string, sourceCategory: string, destinationCategory: string, sourceIndex: number, destinationIndex: number) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [
        { _id: crypto.randomUUID(), title: "Read 20 pages", type: "binary", isActive: true, category: "Learning" },
        { _id: crypto.randomUUID(), title: "Deep Work", type: "timer", targetTimeMinutes: 90, isActive: true, category: "Work" },
        { _id: crypto.randomUUID(), title: "Exercise", type: "binary", isActive: true, category: "Health" },
      ],
      logs: {},
      journals: {},
      transcripts: {},
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
        set((state) => {
          // Clean up orphaned log entries for the removed habit
          const newLogs = { ...state.logs };
          Object.keys(newLogs).forEach(key => {
            if (key.endsWith(`_${id}`)) {
              delete newLogs[key];
            }
          });
          return {
            habits: state.habits.filter((h) => h._id !== id),
            logs: newLogs,
          };
        });
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
      setTranscript: (date, text) => {
        set((state) => ({
          transcripts: { ...state.transcripts, [date]: text }
        }));
      },
      setAudioFile: (date, fileId) => {
        set((state) => ({
          audioFiles: { ...state.audioFiles, [date]: fileId }
        }));
      },
      restoreData: (data) => {
        set({
          habits: data.habits || [],
          logs: data.logs || {},
          journals: data.journals || {},
          transcripts: data.transcripts || {},
          audioFiles: data.audioFiles || {},
        });
      },
      reorderHabit: (habitId, sourceCategory, destinationCategory, sourceIndex, destinationIndex) => {
        set((state) => {
          const habits = [...state.habits];
          
          const categorySet = new Set<string>();
          habits.forEach(h => categorySet.add(h.category || 'General'));
          categorySet.add(sourceCategory);
          categorySet.add(destinationCategory);
          
          const categories = Array.from(categorySet);
          
          const grouped: Record<string, Habit[]> = {};
          categories.forEach(c => grouped[c] = []);
          habits.forEach(h => {
            grouped[h.category || 'General'].push(h);
          });
          
          const [movedHabit] = grouped[sourceCategory].splice(sourceIndex, 1);
          if (!movedHabit) return state;
          
          movedHabit.category = destinationCategory === 'General' ? undefined : destinationCategory;
          grouped[destinationCategory].splice(destinationIndex, 0, movedHabit);
          
          const newHabits = categories.flatMap(c => grouped[c]);
          return { habits: newHabits };
        });
      },
    }),
    {
      name: 'habit-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState as HabitState;
      },
    }
  )
);

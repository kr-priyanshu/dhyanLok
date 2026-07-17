import ActionLog from '../models/ActionLog';
import Habit from '../models/Habit';
import { subDays, format, parseISO } from 'date-fns';

export async function calculateStreak(habitId: string, userId: string, dateStr: string): Promise<number> {
  const habit = await Habit.findById(habitId);
  if (!habit) return 0;

  const logs = await ActionLog.find({ habitId, userId }).sort({ date: -1 });
  
  let streak = 0;
  let currentCheckDate = parseISO(dateStr);
  
  let safety = 1000;
  while(safety-- > 0) {
     currentCheckDate = subDays(currentCheckDate, 1);
     const dayOfWeek = currentCheckDate.getDay();
     if (!habit.frequency.includes(dayOfWeek)) {
       // Habit not scheduled for this day, skip it
       continue;
     }
     
     const dateString = format(currentCheckDate, 'yyyy-MM-dd');
     const log = logs.find(l => l.date === dateString);
     if (log && log.status === 'completed') {
       streak++;
     } else {
       break; // Streak broken
     }
  }
  
  return streak;
}

export async function calculateXP(habitId: string, userId: string, dateStr: string, timeSpent?: number): Promise<number> {
   const habit = await Habit.findById(habitId);
   if (!habit) return 0;
   
   let baseXP = 10;
   if (habit.type === 'timer' && timeSpent) {
     baseXP += Math.floor(timeSpent / 2);
   }
   
   const previousStreak = await calculateStreak(habitId, userId, dateStr);
   const currentStreak = previousStreak + 1; // including today
   
   let multiplier = 1.0;
   if (currentStreak >= 30) multiplier = 2.0;
   else if (currentStreak >= 7) multiplier = 1.5;
   else if (currentStreak >= 3) multiplier = 1.2;
   
   return Math.floor(baseXP * multiplier);
}

import cron from 'node-cron';
import Habit from './models/Habit';
import ActionLog from './models/ActionLog';
import User from './models/User';
import { subDays, format } from 'date-fns';

export function initCronJobs() {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily midnight cron job to calculate penalties...');
    try {
      const yesterdayDate = subDays(new Date(), 1);
      const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');
      const dayOfWeek = yesterdayDate.getDay();

      const activeHabits = await Habit.find({
        isActive: true,
        frequency: dayOfWeek
      });

      for (const habit of activeHabits) {
        const log = await ActionLog.findOne({
          habitId: habit._id,
          date: yesterdayStr
        });

        if (!log || (log.status !== 'completed' && log.status !== 'skipped')) {
          const newLog = new ActionLog({
            userId: habit.userId,
            habitId: habit._id,
            date: yesterdayStr,
            status: 'failed',
            xpEarned: -5 // deduct 5 XP
          });
          await newLog.save();

          const user = await User.findById(habit.userId);
          if (user) {
            user.xpTotal = Math.max(0, user.xpTotal - 5);
            user.level = Math.floor(user.xpTotal / 100) + 1;
            await user.save();
          }
        }
      }
      console.log('Daily cron job completed.');
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });
}

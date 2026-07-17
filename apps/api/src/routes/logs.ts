import { Router } from 'express';
import ActionLog from '../models/ActionLog';
import User from '../models/User';
import { calculateXP } from '../utils/gamification';
import { format } from 'date-fns';

const router = Router();

// Get logs for a user (can filter by habitId or date range)
router.get('/', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    let query: any = { userId };
    if (date) query.date = date; // YYYY-MM-DD
    
    const logs = await ActionLog.find(query);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete or update a log
router.post('/', async (req, res) => {
  try {
    const { userId, habitId, date, status, timeSpent } = req.body;
    
    let xpEarned = 0;
    if (status === 'completed') {
      xpEarned = await calculateXP(habitId, userId, date, timeSpent);
    }
    
    // Upsert the log
    const log = await ActionLog.findOneAndUpdate(
      { userId, habitId, date },
      { status, xpEarned, timeSpent },
      { new: true, upsert: true }
    );
    
    // Update user's total XP and level
    if (status === 'completed') {
      const user = await User.findById(userId);
      if (user) {
        user.xpTotal += xpEarned;
        // Basic leveling logic: 100 XP per level
        user.level = Math.floor(user.xpTotal / 100) + 1;
        await user.save();
      }
    }
    
    res.json({ log, xpEarned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

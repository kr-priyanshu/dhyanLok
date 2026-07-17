import { Router } from 'express';
import Habit from '../models/Habit';

const router = Router();

// Get all habits for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const habits = await Habit.find({ userId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { userId, title, type, targetTimeMinutes, frequency } = req.body;
    const habit = new Habit({ userId, title, type, targetTimeMinutes, frequency });
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

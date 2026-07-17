import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initCronJobs } from './cron';
import habitRoutes from './routes/habits';
import logRoutes from './routes/logs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit_tracker';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initCronJobs();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/habits', habitRoutes);
app.use('/api/action-logs', logRoutes);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

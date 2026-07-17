import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'binary' | 'timer';
  targetTimeMinutes?: number;
  frequency: number[]; // Array of weekdays (0-6)
  isActive: boolean;
}

const HabitSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['binary', 'timer'], required: true },
  targetTimeMinutes: { type: Number },
  frequency: { type: [Number], required: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IHabit>('Habit', HabitSchema);

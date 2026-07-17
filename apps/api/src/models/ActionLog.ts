import mongoose, { Schema, Document } from 'mongoose';

export interface IActionLog extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'failed' | 'skipped';
  xpEarned: number;
  timeSpent?: number; // In minutes
}

const ActionLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true }, 
  status: { type: String, enum: ['completed', 'failed', 'skipped'], required: true },
  xpEarned: { type: Number, default: 0 },
  timeSpent: { type: Number }
});

ActionLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export default mongoose.model<IActionLog>('ActionLog', ActionLogSchema);

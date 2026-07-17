import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  xpTotal: number;
  level: number;
  timezone: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  xpTotal: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  timezone: { type: String, default: 'UTC' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);

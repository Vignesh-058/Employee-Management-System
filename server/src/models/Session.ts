import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceId?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  isValid: boolean;
  expiresAt: Date;
  lastActivity: Date;
}

const SessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String, required: true },
  deviceId: { type: String },
  ipAddress: { type: String },
  browser: { type: String },
  os: { type: String },
  isValid: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for auto-expiration (TTL index)
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ refreshToken: 1 });

export default mongoose.model<ISession>('Session', SessionSchema);

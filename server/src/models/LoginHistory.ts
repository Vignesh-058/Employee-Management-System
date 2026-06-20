import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  status: 'Success' | 'Failed';
  failureReason?: string;
}

const LoginHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  device: { type: String },
  browser: { type: String },
  os: { type: String },
  country: { type: String },
  status: { type: String, enum: ['Success', 'Failed'], required: true },
  failureReason: { type: String }
}, { timestamps: true });

LoginHistorySchema.index({ userId: 1 });
LoginHistorySchema.index({ timestamp: -1 });

export default mongoose.model<ILoginHistory>('LoginHistory', LoginHistorySchema);

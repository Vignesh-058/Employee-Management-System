import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum Role {
  SUPER_ADMIN = 'Super Admin',
  EMPLOYEE = 'Employee'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  authProvider: 'local' | 'google';
  role: Role;
  employeeId?: mongoose.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isVerified?: boolean;
  verificationToken?: string;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  avatar?: string;
  phone?: string;
  department?: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function(this: any) { return this.authProvider === 'local'; } },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: Object.values(Role), default: Role.EMPLOYEE },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  twoFactorSecret: String,
  isTwoFactorEnabled: { type: Boolean, default: false },
  avatar: { type: String },
  phone: { type: String },
  department: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

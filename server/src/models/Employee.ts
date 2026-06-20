import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: mongoose.Types.ObjectId;
  designation: string;
  salary: number;
  joiningDate: Date;
  profileImage?: string;
  performanceScore: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  userId?: mongoose.Types.ObjectId;
}

const EmployeeSchema: Schema = new Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  designation: { type: String, required: true },
  salary: { type: Number, required: true },
  joiningDate: { type: Date, required: true },
  profileImage: { type: String },
  performanceScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ joiningDate: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ createdAt: 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);

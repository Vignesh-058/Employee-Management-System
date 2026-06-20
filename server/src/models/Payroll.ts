import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  status: 'Pending' | 'Paid';
}

const PayrollSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
}, { timestamps: true });

PayrollSchema.index({ month: 1, year: 1 });
PayrollSchema.index({ employeeId: 1 });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);

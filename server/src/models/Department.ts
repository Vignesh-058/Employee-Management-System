import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  departmentName: string;
  manager?: mongoose.Types.ObjectId;
  employeeCount: number;
}

const DepartmentSchema: Schema = new Schema({
  departmentName: { type: String, required: true, unique: true },
  manager: { type: Schema.Types.ObjectId, ref: 'Employee' },
  employeeCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);

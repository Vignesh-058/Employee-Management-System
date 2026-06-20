import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  workingHours?: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
}

const AttendanceSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  workingHours: { type: Number },
  status: { type: String, enum: ['Present', 'Absent', 'Half Day', 'On Leave'], default: 'Present' }
}, { timestamps: true });

AttendanceSchema.index({ employeeId: 1, date: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);

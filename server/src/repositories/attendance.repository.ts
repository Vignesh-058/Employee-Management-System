import { BaseRepository } from './base.repository';
import Attendance, { IAttendance } from '../models/Attendance';

class AttendanceRepository extends BaseRepository<IAttendance> {
  constructor() {
    super(Attendance);
  }

  async getStats() {
    return this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

export const attendanceRepository = new AttendanceRepository();

import { attendanceRepository } from '../repositories/attendance.repository';

class AttendanceService {
  async markAttendance(data: any) {
    return attendanceRepository.create(data);
  }

  async getStats() {
    return attendanceRepository.getStats();
  }
}

export const attendanceService = new AttendanceService();

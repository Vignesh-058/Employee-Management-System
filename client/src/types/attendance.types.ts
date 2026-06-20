export interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    department: {
      departmentName: string;
    };
  } | string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late';
  workingHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceInput {
  employeeId?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late';
}

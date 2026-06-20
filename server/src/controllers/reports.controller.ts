import { Request, Response, NextFunction } from 'express';
import Payroll from '../models/Payroll';
import Attendance from '../models/Attendance';

export const exportPayrollReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payrolls = await Payroll.find().populate('employeeId', 'name email department');
    
    // Create CSV String
    let csv = 'Employee Name,Email,Basic Salary,Bonus,Deduction,Net Salary,Month\n';
    payrolls.forEach((p: any) => {
      csv += `${p.employeeId?.name || 'N/A'},${p.employeeId?.email || 'N/A'},${p.basicSalary},${p.bonus},${p.deduction},${p.netSalary},${p.month}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('payroll_report.csv');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportAttendanceReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await Attendance.find().populate('employeeId', 'name email department');
    
    // Create CSV String
    let csv = 'Employee Name,Email,Date,Status,Check In,Check Out,Working Hours\n';
    records.forEach((r: any) => {
      csv += `${r.employeeId?.name || 'N/A'},${r.employeeId?.email || 'N/A'},${r.date},${r.status},${r.checkIn || 'N/A'},${r.checkOut || 'N/A'},${r.workingHours || 0}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

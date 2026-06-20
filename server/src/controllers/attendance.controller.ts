import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { emitToAll } from '../socket/socket';

export const markAttendance = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      employeeId: req.user.employeeId || req.body.employeeId
    };

    const attendance = await attendanceService.markAttendance(data);

    // Real-time attendance update broadcast
    try {
      emitToAll('attendance:update', {
        employeeId: data.employeeId,
        status: data.status,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      });
    } catch (_e) { /* silent */ }

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await attendanceService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { payrollService } from '../services/payroll.service';
import AuditLog from '../models/AuditLog';
import { emitToUser } from '../socket/socket';

export const createPayroll = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const payroll = await payrollService.createPayroll(req.body);

    // Audit log
    await AuditLog.create({
      userId: req.user?.id,
      action: 'PAYROLL_GENERATED',
      details: `Payroll record generated for employee ${req.body.employeeId}`,
      ipAddress: req.ip,
    });

    // Notify employee in real-time
    try {
      if (req.body.employeeId) {
        // Find user associated with employee to notify them
        const Employee = (await import('../models/Employee')).default;
        const emp = await Employee.findById(req.body.employeeId).select('userId');
        if (emp?.userId) {
          emitToUser(emp.userId.toString(), 'notification:new', {
            title: 'Payslip Generated',
            message: `Your payslip for ${req.body.month}/${req.body.year} has been generated.`,
            type: 'success',
          });
        }
      }
    } catch (_e) {
      // silent fail
    }

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    next(error);
  }
};

export const getPayrolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    next(error);
  }
};

export const getPayrollStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await payrollService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

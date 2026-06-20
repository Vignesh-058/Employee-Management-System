import { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import AuditLog from '../models/AuditLog';
import { emitToAll } from '../socket/socket';

export const createEmployee = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.createEmployee(req.body);

    // Audit log
    await AuditLog.create({
      userId: req.user?.id,
      action: 'EMPLOYEE_CREATE',
      details: `Employee "${employee.name}" (${employee.employeeId}) was created`,
      ipAddress: req.ip,
    });

    // Broadcast to admins/HR that a new employee was added
    try {
      emitToAll('employee:update', { action: 'create', employeeId: employee._id });
    } catch (_e) { /* silent */ }

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id as string);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id as string, req.body);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Audit log
    await AuditLog.create({
      userId: req.user?.id,
      action: 'EMPLOYEE_UPDATE',
      details: `Employee "${(employee as any).name}" was updated`,
      ipAddress: req.ip,
    });

    try {
      emitToAll('employee:update', { action: 'update', employeeId: employee._id });
    } catch (_e) { /* silent */ }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id as string);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Audit log
    await AuditLog.create({
      userId: req.user?.id,
      action: 'EMPLOYEE_DELETE',
      details: `Employee ID ${req.params.id} was deleted`,
      ipAddress: req.ip,
    });

    try {
      emitToAll('employee:update', { action: 'delete', employeeId: req.params.id });
    } catch (_e) { /* silent */ }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

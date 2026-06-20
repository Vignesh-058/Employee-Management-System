import { Request, Response, NextFunction } from 'express';
import { leaveService } from '../services/leave.service';

export const applyLeave = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body, employeeId: req.user._id || req.user.id };
    const leave = await leaveService.applyLeave(data);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    next(error);
  }
};

export const getLeaveById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.id as string);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const leave = await leaveService.updateLeaveStatus(req.params.id as string, status, req.user.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

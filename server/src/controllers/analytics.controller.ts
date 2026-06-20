import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpis = await analyticsService.getDashboardKPIs();
    res.status(200).json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeGrowth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getEmployeeGrowth();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getDepartmentDistribution();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPayrollAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getPayrollAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getAttendanceAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getLeaveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getLeaveAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getHiringAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getHiringAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSalaryDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSalaryDistribution();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getMonthlyExpenses();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPerformanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getPerformanceAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

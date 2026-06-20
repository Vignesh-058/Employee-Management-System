import { Router } from 'express';
import {
  getDashboardAnalytics,
  getEmployeeGrowth,
  getDepartmentDistribution,
  getPayrollAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getHiringAnalytics,
  getSalaryDistribution,
  getMonthlyExpenses,
  getPerformanceAnalytics
} from '../controllers/analytics.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { cacheData } from '../middlewares/cache.middleware';

const router = Router();

router.use(protect);
// Allow all HR staff and above for analytics (not just Super Admin)
router.use(authorize('Super Admin', 'HR Manager', 'Department Manager'));

// 300 seconds = 5 minutes cache
router.get('/dashboard', cacheData(300), getDashboardAnalytics);
router.get('/employee-growth', cacheData(300), getEmployeeGrowth);
router.get('/department-distribution', cacheData(300), getDepartmentDistribution);
router.get('/payroll', cacheData(300), getPayrollAnalytics);
router.get('/attendance', cacheData(300), getAttendanceAnalytics);
router.get('/leave', cacheData(300), getLeaveAnalytics);
router.get('/hiring', cacheData(300), getHiringAnalytics);
router.get('/salary-distribution', cacheData(300), getSalaryDistribution);
router.get('/monthly-expenses', cacheData(300), getMonthlyExpenses);
router.get('/performance', cacheData(300), getPerformanceAnalytics);

export default router;

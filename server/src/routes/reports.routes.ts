import { Router } from 'express';
import { exportPayrollReport, exportAttendanceReport } from '../controllers/reports.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('Super Admin', 'HR Manager'));

router.get('/payroll/export', exportPayrollReport);
router.get('/attendance/export', exportAttendanceReport);

export default router;

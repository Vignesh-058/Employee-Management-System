import { Router } from 'express';
import {
  createPayroll,
  getPayrolls,
  getPayrollStats
} from '../controllers/payroll.controller';
import Payroll from '../models/Payroll';
import { advancedResults } from '../middlewares/advancedResults';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('Super Admin')); // Payroll is highly sensitive

router.route('/stats').get(getPayrollStats);

router.route('/')
  .post(createPayroll)
  .get(advancedResults(Payroll, 'employeeId'), getPayrolls);

export default router;

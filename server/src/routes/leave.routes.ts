import { Router } from 'express';
import {
  applyLeave,
  getLeaves,
  getLeaveById,
  updateLeaveStatus
} from '../controllers/leave.controller';
import LeaveRequest from '../models/LeaveRequest';
import { advancedResults } from '../middlewares/advancedResults';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .post(applyLeave)
  .get(
    (req: any, res: any, next: any) => {
      if (req.user.role === 'Employee') {
        req.query.employeeId = req.user.id;
      }
      next();
    },
    advancedResults(LeaveRequest, 'employeeId approvedBy'), 
    getLeaves
  );

router.route('/:id')
  .get(getLeaveById)
  .put(authorize('HR Manager', 'Super Admin'), updateLeaveStatus);

export default router;

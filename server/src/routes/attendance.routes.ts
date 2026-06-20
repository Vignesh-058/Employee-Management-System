import { Router } from 'express';
import {
  markAttendance,
  getAttendance,
  getAttendanceStats
} from '../controllers/attendance.controller';
import Attendance from '../models/Attendance';
import { advancedResults } from '../middlewares/advancedResults';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/stats').get(getAttendanceStats);

router.route('/')
  .post(markAttendance)
  .get(
    (req: any, res: any, next: any) => {
      if (req.user.role === 'Employee') {
        req.query.employeeId = req.user.id;
      }
      next();
    },
    advancedResults(Attendance, 'employeeId'), 
    getAttendance
  );

export default router;

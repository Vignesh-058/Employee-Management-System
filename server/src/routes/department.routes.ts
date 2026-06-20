import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller';
import Department from '../models/Department';
import { advancedResults } from '../middlewares/advancedResults';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .post(authorize('Super Admin'), createDepartment)
  .get(advancedResults(Department, 'manager'), getDepartments);

router.route('/:id')
  .get(getDepartmentById)
  .put(authorize('Super Admin'), updateDepartment)
  .delete(authorize('Super Admin'), deleteDepartment);

export default router;

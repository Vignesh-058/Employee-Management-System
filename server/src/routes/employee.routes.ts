import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from '../controllers/employee.controller';
import Employee from '../models/Employee';
import { advancedResults } from '../middlewares/advancedResults';
import { protect, authorize } from '../middlewares/auth.middleware';
import { upload } from '../utils/cloudinary';

const router = Router();

router.use(protect); // All employee routes require authentication

router.route('/')
  .post(authorize('Super Admin'), createEmployee)
  .get(advancedResults(Employee, 'department'), getEmployees);

router.post('/:id/upload-photo', authorize('Super Admin', 'HR Manager'), upload.single('file'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }
  // The Cloudinary URL is in req.file.path
  const employee = await Employee.findByIdAndUpdate(req.params.id, { profileImage: req.file.path }, { new: true });
  res.status(200).json({ success: true, data: employee });
});

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('Super Admin'), updateEmployee)
  .delete(authorize('Super Admin'), deleteEmployee);

export default router;

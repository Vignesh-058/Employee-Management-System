import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('Super Admin', 'HR Manager', 'Department Manager'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('Super Admin', 'HR Manager', 'Department Manager'), deleteTask);

export default router;

import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';

export const getTasks = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    let query: any = {};
    if (req.user.role === 'Employee') {
      query.assignee = req.user.id;
    }
    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar role')
      .populate('assigner', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('assigner', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'Employee' && task.assignee._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    req.body.assigner = req.user.id;
    const task = await Task.create(req.body);

    await Notification.create({
      userId: task.assignee,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${task.title}`,
      type: 'System',
      isRead: false
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'TASK_CREATED',
      details: `Created task ${task.title} for user ${task.assignee}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('assigner', 'name email avatar');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Employees can only update status
    if (req.user.role === 'Employee') {
      if (task.assignee.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      const allowedUpdates = ['status'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ success: false, message: 'Employees can only update task status' });
      }
    }

    const oldStatus = task.status;
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignee', 'name email avatar').populate('assigner', 'name email avatar');

    // Notify assigner if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      await Notification.create({
        userId: task!.assigner,
        title: 'Task Status Updated',
        message: `Task "${task!.title}" moved to ${req.body.status}`,
        type: 'System',
        isRead: false
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    await AuditLog.create({
      userId: req.user.id,
      action: 'TASK_DELETED',
      details: `Deleted task ${task.title}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

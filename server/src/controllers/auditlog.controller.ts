import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export const getAuditLogs = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const filter: any = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (userId) filter.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogStats = async (req: Request | any, res: Response, next: NextFunction) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

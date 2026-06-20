import { Router } from 'express';
import { getAuditLogs, getAuditLogStats } from '../controllers/auditlog.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('Super Admin', 'HR Manager'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditLogStats);

export default router;

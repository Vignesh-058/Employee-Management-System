import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';

const app: Application = express();

// Security Middlewares
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './utils/swagger';

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent NoSQL injections
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Setup Swagger Docs
setupSwagger(app);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));



// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import path from 'path';
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// HTTP Request Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

import employeeRoutes from './routes/employee.routes';
import departmentRoutes from './routes/department.routes';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import payrollRoutes from './routes/payroll.routes';
import leaveRoutes from './routes/leave.routes';
import reportsRoutes from './routes/reports.routes';
import analyticsRoutes from './routes/analytics.routes';

import notificationRoutes from './routes/notification.routes';
import auditlogRoutes from './routes/auditlog.routes';
import taskRoutes from './routes/task.routes';


// Base Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Enterprise Employee Management API. Go to /api/health to check status.' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'EMS API is running smoothly.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditlogRoutes);
app.use('/api/tasks', taskRoutes);


// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Resource not found' });
});

import { errorHandler } from './middlewares/error.middleware';

// Global Error Handler
app.use(errorHandler);

export default app;

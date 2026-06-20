import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { analyticsService } from '../services/analytics.service';
import User from '../models/User';
import jwt from 'jsonwebtoken';

jest.mock('../services/analytics.service');

describe('Analytics API', () => {
  let token: string;
  let adminId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_test_analytics';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    await User.deleteMany({});
    adminId = new mongoose.Types.ObjectId().toString();
    await User.create({
      _id: adminId,
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Super Admin',
      department: new mongoose.Types.ObjectId()
    });
    token = jwt.sign({ id: adminId, role: 'Super Admin' }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/analytics/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return dashboard KPIs for Super Admin', async () => {
      const mockKPIs = {
        totalEmployees: 100,
        activeEmployees: 90,
        departments: 5,
        payrollCost: 500000,
        attendanceRate: 95,
        employeesOnLeave: 5,
        newHires: 10,
        pendingRequests: 2
      };

      (analyticsService.getDashboardKPIs as jest.Mock).mockResolvedValue(mockKPIs);

      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockKPIs);
    });
  });

  describe('GET /api/analytics/employee-growth', () => {
    it('should return employee growth data', async () => {
      const mockData = [{ month: 'Jan', employees: 5 }, { month: 'Feb', employees: 10 }];
      (analyticsService.getEmployeeGrowth as jest.Mock).mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/analytics/employee-growth')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
    });
  });

  describe('GET /api/analytics/payroll', () => {
    it('should return payroll trends data', async () => {
      const mockData = [{ month: 'Jan', Basic: 4000, Bonus: 500, Deductions: 100, Net: 4400 }];
      (analyticsService.getPayrollAnalytics as jest.Mock).mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/analytics/payroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
    });
  });

});

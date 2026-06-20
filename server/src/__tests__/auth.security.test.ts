import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/User';

describe('Authentication Security Tests', () => {
  beforeAll(async () => {
    // Connect to a test database (assuming mongoose is not already connected by app)
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_test_auth';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    // Create a base user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Security User',
        email: 'security@example.com',
        password: 'Password123!' // strong password
      });
  });

  describe('Account Lockout (Brute Force Protection)', () => {
    it('should lock account after 5 failed login attempts', async () => {
      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'security@example.com', password: 'WrongPassword123!' });
        expect(res.status).toBe(401);
      }

      // 6th attempt should return a lock message
      const lockedRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'security@example.com', password: 'WrongPassword123!' });
      
      expect(lockedRes.status).toBe(401);
      expect(lockedRes.body.message).toContain('Account locked');
      
      // Verify database state
      const user = await User.findOne({ email: 'security@example.com' });
      expect(user?.failedLoginAttempts).toBeGreaterThanOrEqual(5);
      expect(user?.lockUntil).toBeInstanceOf(Date);
    });

    it('should reset failed attempts on successful login', async () => {
      // 2 failed attempts
      await request(app).post('/api/auth/login').send({ email: 'security@example.com', password: 'WrongPassword123!' });
      await request(app).post('/api/auth/login').send({ email: 'security@example.com', password: 'WrongPassword123!' });
      
      let user = await User.findOne({ email: 'security@example.com' });
      expect(user?.failedLoginAttempts).toBe(2);

      // Successful login
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'security@example.com', password: 'Password123!' });
      expect(res.status).toBe(200);

      // Verify reset
      user = await User.findOne({ email: 'security@example.com' });
      expect(user?.failedLoginAttempts).toBe(0);
      expect(user?.lockUntil).toBeUndefined();
    });
  });

  describe('Zod Validation Middleware', () => {
    it('should reject weak passwords on registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Weak Pass User',
          email: 'weak@example.com',
          password: 'password' // No uppercase, no numbers, no special chars
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.some((e: any) => e.field === 'password')).toBe(true);
    });

    it('should require valid email on login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.some((e: any) => e.field === 'email')).toBe(true);
    });
  });
});

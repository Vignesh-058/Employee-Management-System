import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import Session from '../models/Session';
import LoginHistory from '../models/LoginHistory';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import UAParser from 'ua-parser-js';

class AuthService {
  private generateTokens(user: any) {
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey', {
      expiresIn: '15m'
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');

    return { accessToken, refreshToken };
  }

  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(`Email already registered as ${existingUser.role}. Please login or use a different email.`);
    }
    const user = await userRepository.create(data);
    const { accessToken, refreshToken } = this.generateTokens(user);

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { tokens: { accessToken, refreshToken }, user };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await userRepository.findByEmail(email);

    const parser = new UAParser(userAgent || '');
    const device = parser.getDevice().type || 'Desktop';
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      await LoginHistory.create({ userId: user._id, ipAddress, device, browser, os, status: 'Failed', failureReason: 'Account Locked' });
      throw new Error('Account locked due to multiple failed login attempts. Please try again later.');
    }

    if (!(await user.comparePassword(password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await user.save();
      
      
      await LoginHistory.create({ userId: user._id, ipAddress, device, browser, os, status: 'Failed', failureReason: 'Invalid Password' });
      throw new Error('Invalid credentials');
    }

    // Success
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await LoginHistory.create({ userId: user._id, ipAddress, device, browser, os, status: 'Success' });

    const { accessToken, refreshToken } = this.generateTokens(user);
    
    // Create new session
    await Session.create({
      userId: user._id,
      refreshToken,
      deviceId: crypto.randomUUID(), // tracking unique session
      ipAddress,
      browser,
      os,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { tokens: { accessToken, refreshToken }, user };
  }

  async googleLogin(googleUser: any, ipAddress?: string, userAgent?: string, requestedRole?: string, isLoginAction?: boolean) {
    let user = await userRepository.findByEmail(googleUser.email);
    
    if (!user) {
      if (isLoginAction) {
        throw new Error('Account not found. Please register first.');
      }
      user = await userRepository.create({
        name: googleUser.name,
        email: googleUser.email,
        isVerified: true,
        authProvider: 'google',
        role: requestedRole || 'Employee'
      } as any);
    } else {
      user.authProvider = 'google';
      user.isVerified = true;
      await user.save();
    }

    const parser = new UAParser(userAgent || '');
    const device = parser.getDevice().type || 'Desktop';
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';

    await LoginHistory.create({ userId: user._id, ipAddress, device, browser, os, status: 'Success' });

    const { accessToken, refreshToken } = this.generateTokens(user);

    await Session.create({
      userId: user._id,
      refreshToken,
      deviceId: crypto.randomUUID(),
      ipAddress,
      device,
      browser,
      os,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { tokens: { accessToken, refreshToken }, user };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async refresh(refreshToken: string) {
    const session = await Session.findOne({ refreshToken }).populate('userId');
    if (!session || !session.isValid || session.expiresAt < new Date()) {
      if (session && !session.isValid) {
        // Suspected token reuse! Invalidate all user sessions
        await Session.updateMany({ userId: session.userId }, { isValid: false });
      }
      throw new Error('Invalid refresh token');
    }

    const user: any = session.userId;
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

    // Rotate refresh token
    session.isValid = false; // invalidate old
    await session.save();
    
    await AuditLog.create({ userId: user._id, action: 'TOKEN_REFRESH', details: 'Session tokens successfully refreshed', ipAddress: session.ipAddress });

    await Session.create({
      userId: user._id,
      refreshToken: newRefreshToken,
      deviceId: session.deviceId,
      ipAddress: session.ipAddress,
      browser: session.browser,
      os: session.os,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('There is no user with that email');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await user.save();

    const message = `You are receiving this email because you requested a password reset. Your 6-digit OTP is: \n\n ${otp} \n\n It is valid for 1 minute.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">EMS</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Employee Management System</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px;">
          <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #334155; line-height: 1.5;">Hello,</p>
          <p style="color: #334155; line-height: 1.5;">We received a request to reset the password for your EMS account. Please use the following One-Time Password (OTP) to complete the process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px 30px; border-radius: 8px; border: 2px dashed #bfdbfe;">${otp}</span>
          </div>
          <p style="color: #ef4444; font-size: 13px; text-align: center; font-weight: bold;">⚠️ This OTP is valid for exactly 1 minute.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>If you didn't request this password reset, please ignore this email or contact your IT administrator.</p>
          <p>&copy; ${new Date().getFullYear()} EMS Corporate. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await emailService.sendEmail({ email: user.email, subject: 'EMS - Password Reset OTP', message, html });
      return otp;
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw new Error('Email could not be sent');
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Revoke all existing sessions to enforce security after password reset
    await Session.updateMany({ userId: user._id }, { isValid: false });
    
    await AuditLog.create({ userId: user._id, action: 'PASSWORD_RESET', details: 'Password was successfully reset' });

    const { accessToken, refreshToken } = this.generateTokens(user);
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { tokens: { accessToken, refreshToken }, user };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string; department?: string }) {
    const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user) throw new Error('User not found');
    return user;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error('Incorrect current password');

    user.password = newPassword;
    await user.save();
    
    // Revoke all existing sessions to enforce security
    await Session.updateMany({ userId: user._id }, { isValid: false });
    
    await AuditLog.create({ userId: user._id, action: 'PASSWORD_CHANGE', details: 'Password was manually updated via profile settings' });
    
    return user;
  }

  async logout(refreshToken: string) {
    const session = await Session.findOneAndUpdate({ refreshToken }, { isValid: false });
    if (session) {
      await AuditLog.create({ userId: session.userId, action: 'LOGOUT', details: 'User logged out successfully' });
    }
  }

  async logoutAll(userId: string) {
    await Session.updateMany({ userId, isValid: true }, { isValid: false });
  }

  async getActiveSessions(userId: string) {
    return await Session.find({ userId, isValid: true, expiresAt: { $gt: new Date() } }).select('-refreshToken');
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await Session.findOneAndUpdate({ _id: sessionId, userId }, { isValid: false });
    if (!session) throw new Error('Session not found');
    await AuditLog.create({ userId, action: 'DEVICE_REMOVED', details: `Revoked access for device: ${session.os} - ${session.browser}` });
    return session;
  }

  async sendVerificationEmail(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const message = `Please verify your email by clicking the following link: \n\n ${verifyUrl}`;

    await emailService.sendEmail({ email: user.email, subject: 'Email Verification', message });
  }

  async verifyEmail(token: string) {
    const verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ verificationToken });
    if (!user) throw new Error('Invalid verification token');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    await AuditLog.create({ userId: user._id, action: 'EMAIL_VERIFICATION', details: 'User successfully verified their email' });
    
    return user;
  }
}

export const authService = new AuthService();

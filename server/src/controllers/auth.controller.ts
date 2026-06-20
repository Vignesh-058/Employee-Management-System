
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');
  
  const setCookies = (res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  };
  
  export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokens, user } = await authService.register(req.body);
      setCookies(res, tokens.refreshToken);
      res.status(201).json({ success: true, accessToken: tokens.accessToken, user });
    } catch (error) {
      next(error);
    }
  };
  
  export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
      }
  
      const userAgent = req.headers['user-agent'] || '';
      const { tokens, user } = await authService.login(email, password, req.ip, userAgent);
      setCookies(res, tokens.refreshToken);
      res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message.startsWith('Account locked')) {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, role, isLogin } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'No Google token provided' });
      }

      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Invalid Google token');
      }

      const payload = await response.json();
      
      const userAgent = req.headers['user-agent'] || '';
      const { tokens, user } = await authService.googleLogin(payload, req.ip, userAgent, role, isLogin);
      
      setCookies(res, tokens.refreshToken);
      res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error: any) {
      next(error);
    }
  };
  
  export const logout = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const rfToken = req.cookies.refreshToken;
      if (rfToken) {
        await authService.logout(rfToken);
      }
      res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  };
  
  export const logoutAll = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      await authService.logoutAll(req.user.id);
      res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  };
  
  export const getActiveSessions = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const sessions = await authService.getActiveSessions(req.user.id);
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  };
  
  export const revokeSession = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      await authService.revokeSession(req.user.id, sessionId);
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  };
  
  export const getMe = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
  
  export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rfToken = req.cookies.refreshToken;
      if (!rfToken) {
        return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
      }
  
      const tokens = await authService.refresh(rfToken);
      setCookies(res, tokens.refreshToken);
      res.status(200).json({ success: true, accessToken: tokens.accessToken });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  };
  
  export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const otp = await authService.forgotPassword(req.body.email);
    
    const responseData: any = { success: true, data: 'OTP sent to email' };
    
    // In dev mode, if SMTP is not properly configured (fallback to logging), return the OTP to the client for easy testing.
    if (process.env.NODE_ENV !== 'production' && (process.env.SMTP_USER === undefined || process.env.SMTP_USER === 'user')) {
      responseData.otp = otp;
    }

    res.status(200).json(responseData);
  } catch (error: any) {
    if (error.message === 'There is no user with that email') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
  
  export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp, password } = req.body;
      const { tokens, user } = await authService.resetPassword(email, otp, password);
      setCookies(res, tokens.refreshToken);
      res.status(200).json({ success: true, accessToken: tokens.accessToken });
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  };
  export const updateProfile = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      console.log('Update Profile Payload:', req.body);
      const user = await authService.updateProfile(req.user.id, req.body);
      console.log('Updated User in DB:', { phone: user.phone, department: user.department });
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  import User from '../models/User';

  export const uploadAvatar = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.avatar = '/uploads/' + req.file.filename;
      await user.save();
      // Remove password from response
      const userObj = user.toObject();
      delete userObj.password;
      res.status(200).json({ success: true, data: userObj });
    } catch (error) {
      next(error);
    }
  };
  
  export const updatePassword = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await authService.updatePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      if (error.message === 'Incorrect current password') {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  };
  
  export const sendVerificationEmail = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      await authService.sendVerificationEmail(req.user.id);
      res.status(200).json({ success: true, data: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  };
  
  export const verifyEmail = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      res.status(200).json({ success: true, data: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  



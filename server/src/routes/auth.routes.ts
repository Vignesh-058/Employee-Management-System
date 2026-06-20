import { Router } from 'express';
import { 
  register, login, logout, getMe, refreshToken, 
  forgotPassword, resetPassword, updateProfile, updatePassword,
  logoutAll, getActiveSessions, revokeSession,
  sendVerificationEmail, verifyEmail, googleLogin, uploadAvatar
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  registerSchema, loginSchema, forgotPasswordSchema, 
  resetPasswordSchema, changePasswordSchema, verifyEmailSchema 
} from '../validations/auth.validation';
import { upload } from '../utils/cloudinary';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleLogin);
router.get('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.get('/active-sessions', protect, getActiveSessions);
router.delete('/revoke-session/:sessionId', protect, revokeSession);

router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/forgotpassword', validate(forgotPasswordSchema), forgotPassword);
router.put('/resetpassword', validate(resetPasswordSchema), resetPassword);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/updatepassword', protect, validate(changePasswordSchema), updatePassword);

router.post('/send-verification', protect, sendVerificationEmail);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

export default router;

import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile, useUpdatePassword, useUploadAvatar } from '../hooks/useProfile';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { 
  User, Lock, Mail, Phone, Building, 
  CheckCircle2, AlertCircle, Eye, EyeOff, Calendar, Clock, ChevronRight, Home 
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { user } = useSelector((state: any) => state.auth);
  
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const uploadAvatarMutation = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user, profileForm]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const watchNewPassword = passwordForm.watch('newPassword');

  const onProfileSubmit = async (data: any) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (error) {
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      setPasswordError('');
      await updatePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordSuccess('Password changed successfully');
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (croppedImage) {
        const formData = new FormData();
        formData.append('avatar', croppedImage, 'avatar.jpg');
        await uploadAvatarMutation.mutateAsync(formData);
        setIsCropModalOpen(false);
        setCropImageSrc(null);
      }
    } catch (error) {
      console.error('Failed to crop and upload avatar', error);
    }
  };

  const userInitials = user?.name?.substring(0, 2).toUpperCase() || 'US';
  
  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const origin = baseUrl.replace(/\/api\/?$/, '');
    return `${origin}${avatar}`;
  };
  
  // Calculate password strength
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(watchNewPassword);
  
  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-slate-200 dark:bg-slate-800';
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return 'None';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Fair';
    return 'Strong';
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Breadcrumbs */}
      <div className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
          <Home className="w-4 h-4 mr-2" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 dark:text-slate-100">Account Settings</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Manage your personal profile and secure your account.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Summary (30%) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="h-32 bg-slate-100 dark:bg-slate-800/50 relative"></div>
              <CardContent className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
                
                <div className="relative group -mt-16 mb-4">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-md overflow-hidden relative bg-white dark:bg-slate-900 cursor-pointer" onClick={() => user?.avatar && setIsZoomModalOpen(true)}>
                    {user?.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-4xl font-semibold tracking-wider">
                        {userInitials}
                      </div>
                    )}
                  </div>
                  {/* Pencil Button Overlay */}
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 border-2 border-white dark:border-slate-900"
                    title="Change Photo"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    )}
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5">{user?.email}</p>
                
                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-md text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {user?.role} Account
                </div>

                <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-6"></div>

                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" /> Member Since</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-400" /> Last Login</span>
                    <span className="font-medium text-slate-900 dark:text-white">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings Forms (70%) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Personal Info Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
              <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Update your basic profile information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {profileSuccess && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm flex items-center font-medium border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> {profileSuccess}
                  </div>
                )}
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input type="email" className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input placeholder="+1 (555) 000-0000" className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input placeholder="e.g. Engineering" className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button type="submit" className="h-11 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-lg shadow-sm transition-all active:scale-[0.98]" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-xl">
              <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Security Settings</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {passwordSuccess && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm flex items-center font-medium border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center font-medium border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-500" /> {passwordError}
                  </div>
                )}
                
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</FormLabel>
                          <FormControl>
                            <div className="relative w-full">
                              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                              <Input type={showCurrent ? "text" : "password"} placeholder="Enter current password" className="pl-11 pr-10 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input type={showNew ? "text" : "password"} placeholder="New password" className="pl-11 pr-10 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription className="pt-2">
                              {watchNewPassword && watchNewPassword.length > 0 && (
                                <div className="space-y-1.5 mt-2">
                                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div key={level} className={`h-full flex-1 ${strengthScore >= level ? getStrengthColor(strengthScore) : 'bg-transparent'}`} />
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">Password strength: <span className={getStrengthColor(strengthScore).replace('bg-', 'text-')}>{getStrengthLabel(strengthScore)}</span></p>
                                </div>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input type={showConfirm ? "text" : "password"} placeholder="Confirm password" className="pl-11 pr-10 h-12 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 rounded-lg transition-all" {...field} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mb-4 sm:mb-0 leading-relaxed">
                        Password must be at least 8 characters long and include a number and special character.
                      </p>
                      <Button type="submit" className="h-11 px-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-lg shadow-sm transition-all active:scale-[0.98]" disabled={updatePasswordMutation.isPending}>
                        {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Crop Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden">
            {cropImageSrc && (
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="pt-4">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-slate-900 dark:accent-slate-100"
            />
          </div>
          <DialogFooter className="mt-4 sm:justify-between">
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCropSave} disabled={uploadAvatarMutation.isPending} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900">
              {uploadAvatarMutation.isPending ? 'Saving...' : 'Save Photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isZoomModalOpen} onOpenChange={setIsZoomModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none" aria-describedby={undefined}>
          {user?.avatar && (
            <img src={getAvatarUrl(user.avatar)} alt="Profile Avatar Zoomed" className="w-full h-auto object-contain max-h-[80vh] rounded-xl" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
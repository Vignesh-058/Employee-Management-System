import { useState } from 'react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, X } from 'lucide-react';


const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register = () => {
  const [registerType, setRegisterType] = useState<'Employee' | 'Admin'>('Employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange'
  });

  const passwordValue = watch('password') || '';

  const passwordRules = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'One number', met: /[0-9]/.test(passwordValue) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: registerType === 'Admin' ? 'Super Admin' : 'Employee'
      };
      const res = await api.post(`/auth/register`, payload);
      dispatch(setCredentials({ user: res.data.user, token: res.data.accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 py-12 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create Account</h1>
          <p className="text-sm text-muted-foreground">Sign up for a new {registerType} account</p>
        </div>

        {/* Register Type Tabs */}
        <div className="flex p-1 bg-muted rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${registerType === 'Employee' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setRegisterType('Employee'); setError(''); }}
          >
            Employee
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${registerType === 'Admin' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setRegisterType('Admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">User Name</label>
            <input
              type="text"
              {...register('name')}
              className={`flex h-10 w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-10`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password conditions checklist */}
            {passwordValue && (
              <div className="mt-2 space-y-1 bg-muted/50 p-2 rounded-md border border-border text-xs">
                {passwordRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {rule.met ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-muted-foreground" />}
                    <span className={rule.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                className={`flex h-10 w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-10`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>


        <div className="text-center text-sm">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

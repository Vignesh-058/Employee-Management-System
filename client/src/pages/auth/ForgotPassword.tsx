import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MailCheck } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: { email: string }) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.post(`/auth/forgotpassword`, data);
      setSuccess('OTP sent! Check your email.');
      if (response.data.otp) {
        setDevResetUrl(response.data.otp); // Abusing this state to hold dev OTP
      }
      
      // Redirect to reset password after 3 seconds, passing email in state
      setTimeout(() => {
        navigate('/reset-password', { state: { email: data.email } });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            <p className="text-muted-foreground">{success}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to reset page...</p>
            
            {devResetUrl && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-2">Development Mode Active</p>
                <p className="text-xs text-muted-foreground mb-3">Since email is not configured, here is your OTP:</p>
                <p className="text-2xl font-bold text-blue-500 tracking-widest text-center">
                  {devResetUrl}
                </p>
              </div>
            )}

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full mt-6">
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-primary">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </div>
            
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  placeholder="name@company.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email?.message as string}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

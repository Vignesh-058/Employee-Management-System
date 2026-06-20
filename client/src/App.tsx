import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useEffect, Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, setCredentials } from './store/slices/authSlice';
import api from './lib/axios';
import { useSocket } from './hooks/useSocket';



// Lazy loading components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees').then(module => ({ default: module.Employees })));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails').then(module => ({ default: module.EmployeeDetails })));
const Departments = lazy(() => import('./pages/Departments'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Leave = lazy(() => import('./pages/Leave'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Tasks = lazy(() => import('./pages/Tasks').then(module => ({ default: module.Tasks })));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const SecuritySettings = lazy(() => import('./pages/auth/SecuritySettings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));

import { ErrorBoundary } from './components/ErrorBoundary';

// Socket initializer component – runs inside Redux Provider context
function SocketInitializer() {
  useSocket();
  return null;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get(`/auth/me`);
          dispatch(setCredentials({ user: res.data.data, token }));
        } catch {
          localStorage.removeItem('token');
        }
      }
      dispatch(setLoading(false));
    };
    initAuth();
  }, [dispatch]);

  const fallback = <div className="flex h-screen items-center justify-center">Loading module...</div>;

  return (

      <ErrorBoundary>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SocketInitializer />
          <Suspense fallback={fallback}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Universal Access */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/tasks" element={<Tasks />} />

                {/* HR, Admin, Department Managers */}
                <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'HR Manager', 'Department Manager']} />}>
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/employees/:id" element={<EmployeeDetails />} />
                  <Route path="/departments" element={<Departments />} />
                </Route>

                {/* HR & Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']} />}>
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/security" element={<SecuritySettings />} />
                </Route>

                {/* Super Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>

  );
}

export default App;

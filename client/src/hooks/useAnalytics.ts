import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import {
  DashboardKPIs,
  EmployeeGrowthData,
  DepartmentDistributionData,
  PayrollAnalyticsData,
  AttendanceAnalyticsData,
  LeaveAnalyticsData,
  HiringAnalyticsData,
  SalaryDistributionData,
  MonthlyExpensesData
} from '../types/analytics.types';

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await api.get(url);
  return res.data.data;
};

export const useDashboardKPIs = () => {
  return useQuery<DashboardKPIs>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => fetcher('/analytics/dashboard')
  });
};

export const useEmployeeGrowth = () => {
  return useQuery<EmployeeGrowthData[]>({
    queryKey: ['analytics', 'employee-growth'],
    queryFn: () => fetcher('/analytics/employee-growth')
  });
};

export const useDepartmentDistribution = () => {
  return useQuery<DepartmentDistributionData[]>({
    queryKey: ['analytics', 'department-distribution'],
    queryFn: () => fetcher('/analytics/department-distribution')
  });
};

export const usePayrollAnalytics = () => {
  return useQuery<PayrollAnalyticsData[]>({
    queryKey: ['analytics', 'payroll'],
    queryFn: () => fetcher('/analytics/payroll')
  });
};

export const useAttendanceAnalytics = () => {
  return useQuery<AttendanceAnalyticsData[]>({
    queryKey: ['analytics', 'attendance'],
    queryFn: () => fetcher('/analytics/attendance')
  });
};

export const useLeaveAnalytics = () => {
  return useQuery<LeaveAnalyticsData[]>({
    queryKey: ['analytics', 'leave'],
    queryFn: () => fetcher('/analytics/leave')
  });
};

export const useHiringAnalytics = () => {
  return useQuery<HiringAnalyticsData[]>({
    queryKey: ['analytics', 'hiring'],
    queryFn: () => fetcher('/analytics/hiring')
  });
};

export const useSalaryDistribution = () => {
  return useQuery<SalaryDistributionData[]>({
    queryKey: ['analytics', 'salary-distribution'],
    queryFn: () => fetcher('/analytics/salary-distribution')
  });
};

export const useMonthlyExpenses = () => {
  return useQuery<MonthlyExpensesData[]>({
    queryKey: ['analytics', 'monthly-expenses'],
    queryFn: () => fetcher('/analytics/monthly-expenses')
  });
};

export const usePerformanceAnalytics = () => {
  return useQuery<any[]>({
    queryKey: ['analytics', 'performance'],
    queryFn: () => fetcher('/analytics/performance')
  });
};

export interface DashboardKPIs {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  payrollCost: number;
  attendanceRate: number;
  employeesOnLeave: number;
  newHires: number;
  pendingRequests: number;
}

export interface EmployeeGrowthData {
  month: string;
  employees: number;
}

export interface DepartmentDistributionData {
  department: string;
  employees: number;
}

export interface PayrollAnalyticsData {
  month: string;
  Basic: number;
  Bonus: number;
  Deductions: number;
  Net: number;
}

export interface AttendanceAnalyticsData {
  date: string;
  Attendance: number;
  Present: number;
  Absent: number;
}

export interface LeaveAnalyticsData {
  name: string;
  value: number;
}

export interface HiringAnalyticsData {
  month: string;
  NewHires: number;
  Resignations: number;
  NetGrowth: number;
}

export interface SalaryDistributionData {
  name: string;
  size: number;
}

export interface MonthlyExpensesData {
  name: string;
  Payroll: number;
  Software: number;
  Hardware: number;
  Office: number;
}

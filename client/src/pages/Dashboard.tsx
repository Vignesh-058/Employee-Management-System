import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { motion } from 'framer-motion';
import { Users, Briefcase, CalendarCheck, DollarSign, UserCheck, UserMinus, UserPlus, FileClock } from 'lucide-react';
import { EmployeeGrowthChart } from '../components/charts/EmployeeGrowthChart';
import { DepartmentDistributionChart } from '../components/charts/DepartmentDistributionChart';
import { PayrollAnalysisChart } from '../components/charts/PayrollAnalysisChart';
import { AttendanceTrendChart } from '../components/charts/AttendanceTrendChart';
import { EmployeePerformanceChart } from '../components/charts/EmployeePerformanceChart';
import { SalaryDistributionChart } from '../components/charts/SalaryDistributionChart';
import { HiringAnalyticsChart } from '../components/charts/HiringAnalyticsChart';
import { LeaveAnalyticsChart } from '../components/charts/LeaveAnalyticsChart';
import { MonthlyExpensesChart } from '../components/charts/MonthlyExpensesChart';
import { OrgStructureChart } from '../components/charts/OrgStructureChart';

const KPICard = ({ title, value, icon: Icon, trend, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
      <span className="text-sm text-muted-foreground ml-2">vs last month</span>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm col-span-1 lg:col-span-1 flex flex-col h-full"
  >
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <div className="flex-1 flex flex-col justify-center min-h-[320px]">
      {children}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isEmployee = user?.role === 'Employee';

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: async () => {
      const res = await api.get(`/analytics/dashboard`);
      return res.data.data;
    },
    enabled: !isEmployee // Only fetch admin KPIs if not an employee
  });

  if (isEmployee) {
    return (
      <div className="space-y-6 pb-10">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome to EMS, {user?.name}!</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            You are currently viewing the employee portal. Navigate using the sidebar to view your attendance, request leave, and manage your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Today's Status</p>
              <h3 className="text-2xl font-bold text-foreground">Present</h3>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <FileClock className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Leave Balance</p>
              <h3 className="text-2xl font-bold text-foreground">12 Days</h3>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Next Payroll</p>
              <h3 className="text-2xl font-bold text-foreground">Oct 31</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="Total Employees" value={isLoading ? '...' : kpis?.totalEmployees || 0} icon={Users} trend={2.5} delay={0.1} />
        <KPICard title="Active Employees" value={isLoading ? '...' : kpis?.activeEmployees || 0} icon={UserCheck} trend={1.2} delay={0.2} />
        <KPICard title="Departments" value={isLoading ? '...' : kpis?.departments || 0} icon={Briefcase} trend={0} delay={0.3} />
        <KPICard title="Payroll Cost" value={isLoading ? '...' : `$${(kpis?.payrollCost / 1000).toFixed(1)}k`} icon={DollarSign} trend={4.2} delay={0.4} />
        <KPICard title="Attendance Rate" value={isLoading ? '...' : `${kpis?.attendanceRate || 0}%`} icon={CalendarCheck} trend={-1.1} delay={0.5} />
        <KPICard title="Employees On Leave" value={isLoading ? '...' : kpis?.employeesOnLeave || 0} icon={UserMinus} trend={0.5} delay={0.6} />
        <KPICard title="New Hires" value={isLoading ? '...' : kpis?.newHires || 0} icon={UserPlus} trend={5.4} delay={0.7} />
        <KPICard title="Pending Requests" value={isLoading ? '...' : kpis?.pendingRequests || 0} icon={FileClock} trend={-2.0} delay={0.8} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard title="Employee Growth Trends (Area)" delay={0.5}>
            <EmployeeGrowthChart />
          </ChartCard>
        </div>
        <ChartCard title="Department Distribution (Pie)" delay={0.6}>
          <DepartmentDistributionChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Payroll Analysis (Stacked Bar)" delay={0.7}>
          <PayrollAnalysisChart />
        </ChartCard>
        <ChartCard title="Attendance Trends (Line)" delay={0.8}>
          <AttendanceTrendChart />
        </ChartCard>
        <ChartCard title="Performance Distribution (Radar)" delay={0.9}>
          <EmployeePerformanceChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Leave Analytics (Donut)" delay={1.0}>
          <LeaveAnalyticsChart />
        </ChartCard>
        <div className="xl:col-span-2">
          <ChartCard title="Hiring Analytics (Area)" delay={1.1}>
            <HiringAnalyticsChart />
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Salary Distribution (Treemap)" delay={1.2}>
          <SalaryDistributionChart />
        </ChartCard>
        <ChartCard title="Monthly Expenses (Composed)" delay={1.3}>
          <MonthlyExpensesChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Organization Structure (Interactive Tree)" delay={1.4}>
          <OrgStructureChart />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;

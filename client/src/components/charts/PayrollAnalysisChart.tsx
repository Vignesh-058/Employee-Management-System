import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePayrollAnalytics } from '../../hooks/useAnalytics';
import { ChartSkeleton } from '../ui/ChartSkeleton';

export const PayrollAnalysisChart = () => {
  const { data, isLoading, isError } = usePayrollAnalytics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <div className="text-red-500 text-sm p-4">Failed to load analytics</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm p-4">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
          <Bar dataKey="Basic" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Bonus" stackId="a" fill="#10b981" />
          <Bar dataKey="Deductions" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

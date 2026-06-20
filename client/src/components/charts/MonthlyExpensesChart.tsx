import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMonthlyExpenses } from '../../hooks/useAnalytics';
import { ChartSkeleton } from '../ui/ChartSkeleton';

export const MonthlyExpensesChart = () => {
  const { data, isLoading, isError } = useMonthlyExpenses();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <div className="text-red-500 text-sm p-4">Failed to load analytics</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm p-4">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
          <Area type="monotone" dataKey="Software" fill="#e0e7ff" stroke="#818cf8" />
          <Bar dataKey="Payroll" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="Office" stroke="#10b981" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

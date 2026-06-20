import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useHiringAnalytics } from '../../hooks/useAnalytics';
import { ChartSkeleton } from '../ui/ChartSkeleton';

export const HiringAnalyticsChart = () => {
  const { data, isLoading, isError } = useHiringAnalytics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <div className="text-red-500 text-sm p-4">Failed to load analytics</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm p-4">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Area type="monotone" dataKey="NewHires" stroke="#10b981" fillOpacity={1} fill="url(#colorHired)" />
          <Area type="monotone" dataKey="Resignations" stroke="#ef4444" fillOpacity={1} fill="url(#colorLeft)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

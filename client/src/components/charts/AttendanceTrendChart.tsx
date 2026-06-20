import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAttendanceAnalytics } from '../../hooks/useAnalytics';
import { ChartSkeleton } from '../ui/ChartSkeleton';

export const AttendanceTrendChart = () => {
  const { data, isLoading, isError } = useAttendanceAnalytics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <div className="text-red-500 text-sm p-4">Failed to load analytics</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm p-4">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Line type="monotone" dataKey="Attendance" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

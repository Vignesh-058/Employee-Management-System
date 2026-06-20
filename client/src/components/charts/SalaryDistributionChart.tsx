import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useSalaryDistribution } from '../../hooks/useAnalytics';
import { ChartSkeleton } from '../ui/ChartSkeleton';

export const SalaryDistributionChart = () => {
  const { data, isLoading, isError } = useSalaryDistribution();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <div className="text-red-500 text-sm p-4">Failed to load analytics</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm p-4">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data as any}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#3b82f6"
        >
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

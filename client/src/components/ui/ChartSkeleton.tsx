import { Loader2 } from 'lucide-react';

export const ChartSkeleton = () => {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-muted/20 rounded-lg animate-pulse border border-border/50">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-sm text-muted-foreground font-medium">Loading analytics...</p>
    </div>
  );
};

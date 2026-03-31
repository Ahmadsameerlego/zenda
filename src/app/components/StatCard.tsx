import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from './ui/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  isPositive?: boolean;
}

export function StatCard({ title, value, change, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-semibold text-foreground">{value}</h3>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
            isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  );
}

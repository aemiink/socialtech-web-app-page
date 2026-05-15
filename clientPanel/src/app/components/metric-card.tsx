import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon?: LucideIcon;
  sparklineData?: number[];
}

export function MetricCard({ title, value, change, icon: Icon, sparklineData }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:border-[#AAFF01]/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center group-hover:bg-[#AAFF01]/20 transition-colors">
            <Icon className="w-4 h-4 text-[#AAFF01]" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span className={cn("text-sm font-medium", isPositive ? "text-[#AAFF01]" : "text-destructive")}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-muted-foreground text-xs">önceki döneme göre</span>
        </div>
      </div>

      {sparklineData && (
        <div className="mt-4 h-12 flex items-end gap-1">
          {sparklineData.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-[#AAFF01]/20 rounded-sm transition-all hover:bg-[#AAFF01]/40"
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

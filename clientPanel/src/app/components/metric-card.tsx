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
    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] hover:border-[#AAFF01]/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[#A0A0A0] text-sm">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#AAFF01]/10 flex items-center justify-center group-hover:bg-[#AAFF01]/20 transition-colors">
            <Icon className="w-5 h-5 text-[#AAFF01]" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-3xl text-white">{value}</div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#ff4444]" />
          )}
          <span className={cn("text-sm", isPositive ? "text-[#AAFF01]" : "text-[#ff4444]")}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-[#A0A0A0] text-sm">önceki döneme göre</span>
        </div>
      </div>

      {sparklineData && (
        <div className="mt-4 h-12 flex items-end gap-1">
          {sparklineData.map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-[#AAFF01]/20 rounded-sm transition-all hover:bg-[#AAFF01]/40"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

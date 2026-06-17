import { cn } from '@/lib/utils';
import { isValidElement, type ComponentType, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

type GradientType = 'indigo' | 'emerald' | 'amber' | 'slate' | 'violet';

export interface StatCardProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  footnote?: string;
  trend?: {
    value: string | number;
    label?: string;
    positive?: boolean;
    direction?: 'up' | 'down';
  };
  gradient?: GradientType;
  variant?: GradientType;
  className?: string;
}

const gradientBg: Record<GradientType, string> = {
  indigo: 'from-indigo-500 via-indigo-600 to-violet-700',
  emerald: 'from-emerald-500 via-teal-600 to-green-700',
  amber: 'from-amber-500 via-orange-500 to-rose-500',
  slate: 'from-slate-600 via-slate-700 to-slate-800',
  violet: 'from-violet-500 via-violet-600 to-purple-700',
};

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  footnote,
  trend,
  gradient = 'indigo',
  variant,
  className,
}: StatCardProps) {
  const actualGradient = variant || gradient;
  const isUp = trend?.direction !== 'down' && trend?.positive !== false;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 text-white',
        'bg-gradient-to-br',
        gradientBg[actualGradient],
        className,
      )}
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    'bg-white/20 text-white',
                  )}
                >
                  {typeof trend.value === 'number' ? `${trend.value > 0 ? '+' : ''}${trend.value}%` : trend.value}
                </span>
              )}
            </div>
            {(subtitle || footnote) && (
              <p className="text-sm text-white/70">{subtitle ?? footnote}</p>
            )}
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            {Icon && (
              isValidElement(Icon) ? (
                Icon
              ) : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && '$$typeof' in (Icon as object)) ? (
                (() => {
                  const Comp = Icon as ComponentType<{ className?: string }>;
                  return <Comp className="h-6 w-6" />;
                })()
              ) : (
                Icon as ReactNode
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

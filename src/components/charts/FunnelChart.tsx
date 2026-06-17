import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FunnelDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelDataItem[];
  className?: string;
  showPercentage?: boolean;
}

const defaultColors = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-orange-500',
];

export function FunnelChart({ data, className, showPercentage = true }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        暂无数据
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => {
        const prevValue = index > 0 ? data[index - 1].value : item.value;
        const conversionRate = prevValue > 0 ? (item.value / prevValue) * 100 : 100;
        const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
            className="flex items-center gap-4"
          >
            <div className="w-20 shrink-0 text-right">
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.value} 个</p>
            </div>

            <div className="relative flex-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.1 + 0.1,
                  ease: 'easeOut',
                }}
                className={cn(
                  'h-10 rounded-lg relative overflow-hidden flex items-center justify-between px-4',
                  color,
                )}
                style={{
                  clipPath:
                    index === data.length - 1
                      ? 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)'
                      : index === 0
                        ? 'polygon(0% 0%, 100% 0%, 92% 100%, 8% 100%)'
                        : 'polygon(6% 0%, 94% 0%, 92% 100%, 8% 100%)',
                }}
              >
                <span className="text-sm font-semibold text-white drop-shadow-sm z-10 relative">
                  {item.value}
                </span>
                {showPercentage && index > 0 && (
                  <span className="text-xs font-medium text-white/90 z-10 relative">
                    {conversionRate.toFixed(1)}%
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              </motion.div>

              {showPercentage && index > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center"
                >
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {conversionRate >= 100 ? '=' : ''}
                    {conversionRate.toFixed(0)}%
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

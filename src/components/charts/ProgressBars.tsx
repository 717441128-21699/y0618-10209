import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface ProgressItem {
  name: string;
  progress: number;
  color?: string;
}

export interface ProgressBarsProps {
  items: ProgressItem[];
  className?: string;
  showValue?: boolean;
  barHeight?: number;
}

const defaultColorSets = [
  { from: 'from-indigo-500', to: 'to-violet-500' },
  { from: 'from-emerald-500', to: 'to-teal-500' },
  { from: 'from-amber-500', to: 'to-orange-500' },
  { from: 'from-sky-500', to: 'to-cyan-500' },
  { from: 'from-rose-500', to: 'to-pink-500' },
  { from: 'from-slate-500', to: 'to-slate-700' },
  { from: 'from-fuchsia-500', to: 'to-purple-500' },
  { from: 'from-lime-500', to: 'to-green-500' },
];

export function ProgressBars({
  items,
  className,
  showValue = true,
  barHeight = 12,
}: ProgressBarsProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        暂无数据
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => {
        const colorSet = defaultColorSets[index % defaultColorSets.length];
        const customColor = item.color;
        const clampedProgress = Math.max(0, Math.min(100, item.progress));

        return (
          <motion.div
            key={`${item.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 truncate max-w-[65%]">
                {item.name}
              </span>
              {showValue && (
                <span className="font-semibold text-slate-900 tabular-nums">
                  {clampedProgress}%
                </span>
              )}
            </div>

            <div
              className="w-full overflow-hidden rounded-full bg-slate-100"
              style={{ height: `${barHeight}px` }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.08 + 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  'h-full rounded-full bg-gradient-to-r relative',
                  customColor || `${colorSet.from} ${colorSet.to}`,
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

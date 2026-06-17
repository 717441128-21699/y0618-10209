import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  subLabels?: string[];
  weight?: string | number;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  subLabels,
  weight,
  showValue = true,
  disabled = false,
  className,
}: SliderProps) {
  const inputId = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  const getColorClass = () => {
    if (value >= 80) return 'from-emerald-400 to-emerald-500';
    if (value >= 60) return 'from-indigo-400 to-indigo-600';
    if (value >= 40) return 'from-amber-400 to-amber-500';
    return 'from-slate-400 to-slate-500';
  };

  const getTextColorClass = () => {
    if (value >= 80) return 'text-emerald-600';
    if (value >= 60) return 'text-indigo-600';
    if (value >= 40) return 'text-amber-600';
    return 'text-slate-600';
  };

  return (
    <div className={cn('w-full group', className)}>
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex-1 min-w-0">
          {label && (
            <div className="flex items-center gap-2 flex-wrap">
              <label
                htmlFor={inputId}
                className={cn(
                  'text-sm font-semibold',
                  disabled ? 'text-slate-400' : 'text-slate-800',
                )}
              >
                {label}
              </label>
              {weight !== undefined && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                  权重 {typeof weight === 'number' ? `${weight}%` : weight}
                </span>
              )}
            </div>
          )}
          {subLabels && subLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {subLabels.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
        {showValue && (
          <motion.div
            key={value}
            initial={{ scale: 0.92, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn(
              'flex-shrink-0 font-display font-bold leading-none',
              getTextColorClass(),
              'text-2xl',
            )}
          >
            {value}
            <span className="text-sm font-medium opacity-50 ml-0.5">分</span>
          </motion.div>
        )}
      </div>

      <div className="relative h-9 flex items-center">
        <div className="absolute w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full bg-gradient-to-r',
              getColorClass(),
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'absolute w-full h-9 z-10 appearance-none bg-transparent cursor-pointer',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-indigo-500',
            '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-indigo-200/60',
            '[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing',
            '[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:hover:shadow-indigo-300/60',
            '[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500',
            '[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab',
            '[&::-moz-range-track]:bg-transparent',
          )}
        />

        <motion.div
          className="pointer-events-none absolute w-6 h-6 rounded-full border-2 border-indigo-500 bg-white shadow-md shadow-indigo-200/60 z-0"
          animate={{
            left: `calc(${percentage}% - 12px)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <motion.div
            className="absolute inset-1 rounded-full bg-indigo-500"
            animate={{ scale: 0.55 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-0.5">
        <span className="text-[10px] text-slate-400 font-medium">{min}</span>
        <span className="text-[10px] text-slate-400 font-medium">{Math.round((min + max) / 2)}</span>
        <span className="text-[10px] text-slate-400 font-medium">{max}</span>
      </div>
    </div>
  );
}

export default Slider;
export { Slider };

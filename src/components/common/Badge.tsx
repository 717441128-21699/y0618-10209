import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'indigo' | 'slate' | 'emerald' | 'amber' | 'red' | 'violet';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-indigo-50 text-indigo-700 border-indigo-100 [&_.badge-dot]:bg-indigo-500',
  indigo:
    'bg-indigo-50 text-indigo-700 border-indigo-100 [&_.badge-dot]:bg-indigo-500',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-100 [&_.badge-dot]:bg-emerald-500',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-100 [&_.badge-dot]:bg-emerald-500',
  warning:
    'bg-amber-50 text-amber-700 border-amber-100 [&_.badge-dot]:bg-amber-500',
  amber:
    'bg-amber-50 text-amber-700 border-amber-100 [&_.badge-dot]:bg-amber-500',
  danger:
    'bg-red-50 text-red-700 border-red-100 [&_.badge-dot]:bg-red-500',
  red:
    'bg-red-50 text-red-700 border-red-100 [&_.badge-dot]:bg-red-500',
  info:
    'bg-slate-100 text-slate-700 border-slate-200 [&_.badge-dot]:bg-slate-500',
  slate:
    'bg-slate-100 text-slate-700 border-slate-200 [&_.badge-dot]:bg-slate-500',
  violet:
    'bg-violet-50 text-violet-700 border-violet-100 [&_.badge-dot]:bg-violet-500',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 h-5 px-2 rounded-md text-[11px] font-medium border',
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {dot && (
          <span className="badge-dot w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-soft" />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
export default Badge;

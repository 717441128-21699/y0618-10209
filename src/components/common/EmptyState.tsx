import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  iconVariant?: 'indigo' | 'emerald' | 'amber' | 'slate';
  className?: string;
}

const iconBgMap: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-500',
};

function EmptyState({
  icon,
  title,
  description,
  action,
  iconVariant = 'indigo',
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'card-base flex flex-col items-center justify-center text-center py-16 px-8',
        className,
      )}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-5',
          '[&_svg]:w-9 [&_svg]:h-9',
          iconBgMap[iconVariant],
        )}
      >
        {icon}
      </div>

      <h3 className="font-display text-xl font-bold text-slate-900 leading-snug">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button variant="primary" size="md" icon={action.icon} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default EmptyState;

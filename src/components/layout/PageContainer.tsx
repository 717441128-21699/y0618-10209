import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function PageContainer({
  title,
  subtitle,
  children,
  actions,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-start justify-between gap-6 mb-6 flex-shrink-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0"
      >
        {Array.isArray(children) ? (
          (children as ReactNode[]).map((child, idx) => (
            <motion.div key={idx} variants={itemVariant}>
              {child}
            </motion.div>
          ))
        ) : (
          <motion.div variants={itemVariant} className="h-full">
            {children}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export { PageContainer };
export type { PageContainerProps };
export default PageContainer;

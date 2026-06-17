import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  label: string;
  icon?: ReactNode;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  allowClickBack?: boolean;
}

function Stepper({ steps, currentStep, onStepClick, className, allowClickBack = true }: StepperProps) {
  return (
    <div className={cn('w-full py-2', className)}>
      <div className="flex items-start justify-between relative">
        <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-200 z-0" />
        <motion.div
          className="absolute top-6 left-12 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500 z-0"
          initial={{ width: 0 }}
          animate={{
            width: `calc(${(Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100}% - 6rem)`,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = allowClickBack && index < currentStep && onStepClick;

          return (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center relative z-10 flex-1 min-w-0',
                isClickable && 'cursor-pointer',
              )}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300',
                  isCompleted && 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200',
                  isActive && 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200',
                  !isCompleted && !isActive && 'bg-white border-slate-300 text-slate-400',
                  isClickable && 'hover:shadow-lg',
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  step.icon ? (
                    <span className="w-5 h-5 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5">
                      {step.icon}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )
                )}
              </motion.div>

              <div className="mt-3 text-center px-2 min-w-0 max-w-[120px]">
                <p
                  className={cn(
                    'text-sm font-semibold truncate',
                    isActive && 'text-indigo-700',
                    isCompleted && 'text-emerald-700',
                    !isCompleted && !isActive && 'text-slate-500',
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      'mt-0.5 text-xs truncate',
                      isActive ? 'text-indigo-500' : 'text-slate-400',
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stepper;
export { Stepper };

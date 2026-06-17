import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FilePlus2,
  Eye,
  UserPlus,
  RefreshCw,
  Mic2,
  FileDown,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeColor = 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  link: string;
  theme: ThemeColor;
}

const themeClasses: Record<
  ThemeColor,
  { iconBg: string; icon: string; hover: string; ring: string }
> = {
  indigo: {
    iconBg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    hover: 'hover:bg-indigo-50/60',
    ring: 'group-hover:ring-indigo-200',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    hover: 'hover:bg-emerald-50/60',
    ring: 'group-hover:ring-emerald-200',
  },
  amber: {
    iconBg: 'bg-amber-50',
    icon: 'text-amber-600',
    hover: 'hover:bg-amber-50/60',
    ring: 'group-hover:ring-amber-200',
  },
  sky: {
    iconBg: 'bg-sky-50',
    icon: 'text-sky-600',
    hover: 'hover:bg-sky-50/60',
    ring: 'group-hover:ring-sky-200',
  },
  rose: {
    iconBg: 'bg-rose-50',
    icon: 'text-rose-600',
    hover: 'hover:bg-rose-50/60',
    ring: 'group-hover:ring-rose-200',
  },
  violet: {
    iconBg: 'bg-violet-50',
    icon: 'text-violet-600',
    hover: 'hover:bg-violet-50/60',
    ring: 'group-hover:ring-violet-200',
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

const quickActions: QuickAction[] = [
  {
    id: 'new-app',
    icon: FilePlus2,
    label: '新建申请',
    description: '创建项目申请',
    link: '/applications/new',
    theme: 'indigo',
  },
  {
    id: 'enter-review',
    icon: Eye,
    label: '进入评审',
    description: '评审待审项目',
    link: '/reviews',
    theme: 'emerald',
  },
  {
    id: 'match-mentor',
    icon: UserPlus,
    label: '配对导师',
    description: '分配项目导师',
    link: '/mentoring',
    theme: 'amber',
  },
  {
    id: 'update-data',
    icon: RefreshCw,
    label: '更新数据',
    description: '健康度与进度',
    link: '/health',
    theme: 'sky',
  },
  {
    id: 'schedule-demo',
    icon: Mic2,
    label: '安排Demo',
    description: '路演日筹备',
    link: '/demo-day',
    theme: 'rose',
  },
  {
    id: 'export-report',
    icon: FileDown,
    label: '导出报告',
    description: '期别运营报告',
    link: '/analytics',
    theme: 'violet',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleClick = (link: string) => {
    navigate(link);
  };

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {quickActions.map((action) => {
        const Icon = action.icon;
        const theme = themeClasses[action.theme];

        return (
          <motion.button
            key={action.id}
            variants={cardVariants}
            whileHover={{
              y: -4,
              transition: { duration: 0.18, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleClick(action.link)}
            className={cn(
              'group relative flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-center',
              'transition-all duration-200 ring-1 ring-transparent',
              theme.hover,
              theme.ring,
              'hover:shadow-lg hover:shadow-slate-200/70 hover:border-slate-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
            )}
          >
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200',
                theme.iconBg,
                'group-hover:scale-110 group-hover:rotate-3',
              )}
            >
              <Icon className={cn('h-6 w-6 transition-colors', theme.icon)} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {action.label}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {action.description}
              </p>
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-2 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}

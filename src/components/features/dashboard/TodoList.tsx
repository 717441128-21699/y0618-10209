import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Users,
  Activity,
  CalendarDays,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useReviewStore } from '@/stores/reviewStore';
import { useMentoringStore } from '@/stores/mentoringStore';
import { useHealthStore } from '@/stores/healthStore';
import { useDemoDayStore } from '@/stores/demoDayStore';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

type AccentColor = 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';

interface TodoItem {
  id: string;
  icon: LucideIcon;
  title: string;
  count: number;
  description?: string;
  link: string;
  accent: AccentColor;
}

const accentClasses: Record<AccentColor, { bar: string; iconBg: string; icon: string; badge: string }> = {
  indigo: {
    bar: 'bg-indigo-500',
    iconBg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  emerald: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  sky: {
    bar: 'bg-sky-500',
    iconBg: 'bg-sky-50',
    icon: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700',
  },
  rose: {
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-50',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

export function TodoList() {
  const navigate = useNavigate();

  const pendingReviews = useReviewStore((s) =>
    s.reviews.filter((r) => r.status === 'pending').length,
  );

  const activeAssignments = useMentoringStore((s) =>
    s.assignments.filter((a) => a.status === 'active').length,
  );

  const overdueHealthCount = useHealthStore((s) => s.getOverdueProjects().length);

  const currentDemoDay = useDemoDayStore((s) => s.getCurrentDemoDay());

  const todoItems: TodoItem[] = useMemo(() => {
    const items: TodoItem[] = [
      {
        id: 'reviews',
        icon: ClipboardList,
        title: '待评审申请',
        count: pendingReviews > 0 ? pendingReviews : 5,
        description: pendingReviews > 0 ? `${pendingReviews} 份申请等待评审` : '5 份申请等待评审',
        link: '/reviews',
        accent: 'indigo',
      },
      {
        id: 'mentoring',
        icon: Users,
        title: '待安排辅导',
        count: activeAssignments > 0 ? Math.max(2, Math.ceil(activeAssignments / 2)) : 2,
        description: activeAssignments > 0 ? `${activeAssignments} 个活跃配对需跟进` : '2 个辅导会话待安排',
        link: '/mentoring',
        accent: 'emerald',
      },
      {
        id: 'health',
        icon: Activity,
        title: '健康度待更新',
        count: overdueHealthCount > 0 ? overdueHealthCount : 3,
        description: overdueHealthCount > 0 ? `${overdueHealthCount} 个团队超过7天未更新` : '3 个团队健康度待填写',
        link: '/health',
        accent: 'amber',
      },
    ];

    if (currentDemoDay) {
      const daysLeft = differenceInDays(parseISO(currentDemoDay.date), new Date());
      const isUrgent = daysLeft <= 14;
      items.push({
        id: 'demoday',
        icon: CalendarDays,
        title: '即将到来',
        count: Math.max(0, daysLeft),
        description: `${currentDemoDay.name} · ${daysLeft > 0 ? `还剩 ${daysLeft} 天` : daysLeft === 0 ? '今天' : `已过 ${-daysLeft} 天`}`,
        link: '/demo-day',
        accent: isUrgent ? 'rose' : 'sky',
      });
    } else {
      items.push({
        id: 'demoday',
        icon: CalendarDays,
        title: '即将到来',
        count: 0,
        description: '6月15日演示日',
        link: '/demo-day',
        accent: 'sky',
      });
    }

    return items;
  }, [pendingReviews, activeAssignments, overdueHealthCount, currentDemoDay]);

  const handleItemClick = (link: string) => {
    navigate(link);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {todoItems.map((item) => {
        const Icon = item.icon;
        const accent = accentClasses[item.accent];

        return (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
            onClick={() => handleItemClick(item.link)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200',
              'hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60',
            )}
          >
            <div
              className={cn(
                'absolute left-0 top-0 h-full w-1.5 rounded-l-xl transition-all duration-300',
                accent.bar,
                'group-hover:w-2',
              )}
            />

            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200',
                accent.iconBg,
                'group-hover:scale-110',
              )}
            >
              <Icon className={cn('h-6 w-6', accent.icon)} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                    accent.badge,
                  )}
                >
                  {item.count}
                  {item.id === 'demoday' ? '天' : '项'}
                </span>
              </div>
              {item.description && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {item.description}
                </p>
              )}
            </div>

            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200',
                'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0',
                'group-hover:bg-slate-100 group-hover:text-slate-700',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

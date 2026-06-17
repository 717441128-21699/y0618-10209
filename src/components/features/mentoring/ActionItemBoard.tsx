import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, FolderKanban, AlertTriangle } from 'lucide-react';
import type { ActionItem } from '@/types';
import { Badge } from '@/components/common';
import { cn } from '@/lib/utils';

export interface BoardActionItem extends ActionItem {
  projectName?: string;
}

interface ActionItemBoardProps {
  items: BoardActionItem[];
  className?: string;
}

type ColumnKey = 'pending' | 'in_progress' | 'completed';

const columnConfig: {
  key: ColumnKey;
  title: string;
  accent: string;
  headerBg: string;
  dotColor: string;
}[] = [
  {
    key: 'pending',
    title: '待开始',
    accent: 'border-slate-200 bg-slate-50/50',
    headerBg: 'bg-slate-100 text-slate-700',
    dotColor: 'bg-slate-400',
  },
  {
    key: 'in_progress',
    title: '进行中',
    accent: 'border-indigo-200 bg-indigo-50/50',
    headerBg: 'bg-indigo-100 text-indigo-700',
    dotColor: 'bg-indigo-500',
  },
  {
    key: 'completed',
    title: '已完成',
    accent: 'border-emerald-200 bg-emerald-50/50',
    headerBg: 'bg-emerald-100 text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
];

function isOverdue(dueDate: string, status: ActionItem['status']): boolean {
  if (status === 'completed') return false;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return now > due;
}

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function ActionItemBoard({ items, className }: ActionItemBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<ColumnKey | null>(null);

  const grouped: Record<ColumnKey, BoardActionItem[]> = {
    pending: [],
    in_progress: [],
    completed: [],
  };

  for (const item of items) {
    if (grouped[item.status]) {
      grouped[item.status].push(item);
    }
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-3 w-full',
        className,
      )}
    >
      {columnConfig.map((col) => {
        const colItems = grouped[col.key];
        const isHover = hoverColumn === col.key && draggedId;
        return (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: columnConfig.indexOf(col) * 0.08 }}
            className={cn(
              'rounded-2xl border transition-all duration-200',
              col.accent,
              isHover && 'ring-2 ring-indigo-400/50 scale-[1.01]',
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setHoverColumn(col.key);
            }}
            onDragLeave={() => setHoverColumn(null)}
            onDrop={() => {
              setDraggedId(null);
              setHoverColumn(null);
            }}
          >
            <div
              className={cn(
                'flex items-center justify-between px-5 py-3 rounded-t-2xl border-b border-inherit',
                col.headerBg,
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn('h-2 w-2 rounded-full flex-shrink-0', col.dotColor)}
                />
                <h3 className="font-semibold text-sm">{col.title}</h3>
              </div>
              <Badge
                variant={col.key === 'in_progress' ? 'indigo' : col.key === 'completed' ? 'emerald' : 'slate'}
                className="text-[11px] px-2 py-0"
              >
                {colItems.length}
              </Badge>
            </div>

            <div className="p-3 space-y-3 min-h-[320px]">
              {colItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center mb-2">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <p className="text-xs">暂无任务</p>
                </div>
              ) : (
                colItems.map((item, idx) => {
                  const overdue = isOverdue(item.dueDate, item.status);
                  const isDragging = draggedId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: idx * 0.04 }}
                      draggable
                      onDragStart={() => setDraggedId(item.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setHoverColumn(null);
                      }}
                      className={cn(
                        'group rounded-xl border bg-white p-4 shadow-sm transition-all duration-200',
                        'hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing',
                        overdue && 'border-red-300 ring-1 ring-red-200/70',
                        isDragging && 'opacity-50 scale-95',
                      )}
                    >
                      {overdue && (
                        <div className="flex items-center gap-1 mb-2 text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-semibold">已逾期</span>
                        </div>
                      )}
                      <p
                        className={cn(
                          'text-sm font-medium text-slate-800 mb-3 leading-snug',
                          col.key === 'completed' && 'line-through text-slate-400',
                        )}
                      >
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{item.assignee}</span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            overdue && 'text-red-600 font-medium',
                          )}
                        >
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDueDate(item.dueDate)}</span>
                        </div>
                        {item.projectName && (
                          <div className="flex items-center gap-1">
                            <FolderKanban className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[120px]">
                              {item.projectName}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ActionItemBoard;

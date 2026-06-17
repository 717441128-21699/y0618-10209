import { useState, useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { FileQuestion } from 'lucide-react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T> {
  key: string;
  label: string;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowActions?: DataTableAction<T>[];
  selectable?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  getRowId?: (row: T) => string;
}

function DataTable<T extends object>({
  columns,
  data,
  rowActions,
  selectable = false,
  pageSize = 10,
  emptyTitle = '暂无数据',
  emptyDescription = '还没有任何数据记录',
  onRowClick,
  className,
  getRowId,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = sortedData.slice(startIdx, startIdx + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageData.map((r, i) => getRowId?.(r) ?? String(startIdx + i))));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const displayColumns: DataTableColumn<T>[] = useMemo(() => {
    const cols = [...columns];
    if (rowActions && rowActions.length > 0) {
      cols.push({
        key: '__actions',
        title: '操作',
        fixed: 'right',
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            {rowActions.map((action) => {
              if (action.show && !action.show(row)) return null;
              return (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-colors',
                    action.variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
                    action.variant === 'secondary' && 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    (!action.variant || action.variant === 'ghost') && 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        ),
      });
    }
    return cols;
  }, [columns, rowActions]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <EmptyState
          icon={<FileQuestion />}
          title={emptyTitle}
          description={emptyDescription}
          iconVariant="slate"
        />
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {selectable && (
                <th className="sticky top-0 z-10 px-4 py-3.5 w-12 bg-slate-50/80">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === pageData.length && pageData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              {displayColumns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'sticky top-0 z-10 px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50/80',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.fixed === 'left' && 'left-0 z-20',
                    col.fixed === 'right' && 'right-0 z-20',
                    col.width && `w-${col.width}`,
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
                    >
                      {col.title}
                      {sortKey === String(col.key) ? (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                        )
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    col.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageData.map((row, idx) => {
              const rowId = getRowId?.(row) ?? String(startIdx + idx);
              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03, ease: 'easeOut' }}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'group transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-indigo-50/40',
                    !onRowClick && 'hover:bg-slate-50/60',
                    selectedIds.has(rowId) && 'bg-indigo-50/60',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rowId)}
                        onChange={() => toggleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  {displayColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'px-4 py-3.5 text-sm text-slate-700',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.fixed === 'left' && 'sticky left-0 bg-white group-hover:bg-indigo-50/40 z-10',
                        col.fixed === 'right' && 'sticky right-0 bg-white group-hover:bg-indigo-50/40 z-10',
                      )}
                    >
                      {col.render ? col.render(row, startIdx + idx) : String(row[col.key as keyof T] ?? '-')}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
          <div className="text-xs text-slate-500">
            共 <span className="font-medium text-slate-700">{sortedData.length}</span> 条，
            第 <span className="font-medium text-slate-700">{currentPage}</span> / {totalPages} 页
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all',
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
export { DataTable };

export function formatCurrency(num: number, unit: string = '万元'): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const formatted = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${formatted}${unit}`;
}

export function formatPercentage(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const value = num * 100;
  return `${value.toFixed(1)}%`;
}

export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  if (num >= 10000) {
    const wan = num / 10000;
    return `${wan.toFixed(wan >= 10 ? 0 : 1)}万`;
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

const STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  reviewing: '评审中',
  reviewed: '已评审',
  accepted: '已通过',
  rejected: '已拒绝',
  in_batch: '已入营',
  graduated: '已毕业',
  created: '创建申请'
};

export function formatStatusChinese(status: string): string {
  return STATUS_MAP[status] || status;
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'indigo' | 'slate' | 'emerald' | 'amber' | 'red' | 'violet';

const STATUS_BADGE_MAP: Record<string, BadgeVariant> = {
  draft: 'slate',
  submitted: 'indigo',
  reviewing: 'amber',
  reviewed: 'violet',
  accepted: 'emerald',
  rejected: 'red',
  in_batch: 'emerald',
  graduated: 'success'
};

export function getStatusBadgeVariant(status: string): BadgeVariant {
  return STATUS_BADGE_MAP[status] || 'slate';
}

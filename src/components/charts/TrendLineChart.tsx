import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

const colorMap: Record<string, { stroke: string; fill: string; fillId: string }> = {
  indigo: {
    stroke: '#6366f1',
    fill: 'url(#indigoGradient)',
    fillId: 'indigoGradient',
  },
  emerald: {
    stroke: '#10b981',
    fill: 'url(#emeraldGradient)',
    fillId: 'emeraldGradient',
  },
  amber: {
    stroke: '#f59e0b',
    fill: 'url(#amberGradient)',
    fillId: 'amberGradient',
  },
  violet: {
    stroke: '#8b5cf6',
    fill: 'url(#violetGradient)',
    fillId: 'violetGradient',
  },
  rose: {
    stroke: '#f43f5e',
    fill: 'url(#roseGradient)',
    fillId: 'roseGradient',
  },
  slate: {
    stroke: '#64748b',
    fill: 'url(#slateGradient)',
    fillId: 'slateGradient',
  },
};

export interface TrendLineChartProps {
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'rose' | 'slate';
  title?: string;
  unit?: string;
  height?: number;
  className?: string;
}

export function TrendLineChart({
  data,
  xKey = 'date',
  yKey = 'value',
  color = 'indigo',
  title,
  unit,
  height = 220,
  className,
}: TrendLineChartProps) {
  const colors = colorMap[color] ?? colorMap.indigo;
  const gradientId = `gradient-${color}-${Math.random().toString(36).slice(2, 8)}`;

  const hasData = data && data.length > 0;

  const yDomain = useMemo(() => {
    if (!hasData) return undefined;
    const values = data.map((d) => Number(d[yKey]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.15, 5);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data, yKey, hasData]);

  if (!hasData) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50',
          className,
        )}
        style={{ height }}
      >
        <svg
          className="h-10 w-10 text-slate-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
        <p className="text-sm text-slate-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.28} />
                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              dy={8}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (unit ? `${v}${unit}` : String(v))}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                padding: '10px 14px',
              }}
              labelStyle={{
                color: '#475569',
                fontWeight: 600,
                fontSize: 12,
                marginBottom: 4,
              }}
              itemStyle={{
                color: colors.stroke,
                fontSize: 13,
                fontWeight: 600,
              }}
              formatter={(value: number) => [
                unit ? `${value}${unit}` : value,
                title || '数值',
              ]}
            />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="none"
              fill={`url(#${gradientId})`}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors.stroke}
              strokeWidth={2.5}
              dot={{ fill: colors.stroke, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: colors.stroke, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendLineChart;

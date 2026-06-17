import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  Users,
  GraduationCap,
  Target,
  Rocket,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Check,
  BarChart2,
  Award,
  Calendar,
  Banknote,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  StatCard,
} from '@/components/common';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { cn } from '@/lib/utils';

type AnalyticsTab = 'funnel' | 'mentor' | 'comparison';

const TABS: { key: AnalyticsTab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'funnel', label: '整体漏斗', icon: PieChart },
  { key: 'mentor', label: '导师分析', icon: Award },
  { key: 'comparison', label: '历届对比', icon: BarChart3 },
];

const FUNNEL_DATA = [
  { label: '申请', value: 12, absoluteRate: 100, relativeRate: 100, fill: '#6366f1' },
  { label: '初审通过', value: 10, absoluteRate: 83.3, relativeRate: 83.3, fill: '#8b5cf6' },
  { label: '入营', value: 8, absoluteRate: 66.7, relativeRate: 80, fill: '#14b8a6' },
  { label: '融资对接', value: 5, absoluteRate: 41.7, relativeRate: 62.5, fill: '#f59e0b' },
  { label: '成功获投', value: 3, absoluteRate: 25, relativeRate: 60, fill: '#10b981' },
];

const INDUSTRY_CONVERSION = [
  { industry: '人工智能', apply: 3, pass: 3, inBatch: 2, match: 2, funded: 1 },
  { industry: '新能源', apply: 2, pass: 2, inBatch: 2, match: 1, funded: 1 },
  { industry: '医疗健康', apply: 2, pass: 1, inBatch: 1, match: 1, funded: 0 },
  { industry: '企业服务', apply: 2, pass: 2, inBatch: 1, match: 1, funded: 1 },
  { industry: '硬件/消费', apply: 3, pass: 2, inBatch: 2, match: 0, funded: 0 },
];

const MENTOR_RADAR = [
  { dimension: '辅导频次', 赵导师: 85, 陈导师: 78, 李导师: 90, fullMark: 100 },
  { dimension: '融资率', 赵导师: 72, 陈导师: 88, 李导师: 65, fullMark: 100 },
  { dimension: '完成率', 赵导师: 90, 陈导师: 82, 李导师: 75, fullMark: 100 },
  { dimension: '满意度', 赵导师: 88, 陈导师: 92, 李导师: 80, fullMark: 100 },
  { dimension: '匹配度', 赵导师: 82, 陈导师: 76, 李导师: 88, fullMark: 100 },
];

const MENTOR_TABLE = [
  {
    name: '李导师',
    area: '企业服务 / SaaS',
    projects: 3,
    meetings: 28,
    health: 87.3,
    funded: 2,
    score: 91.5,
    rank: 1,
  },
  {
    name: '陈导师',
    area: '硬科技 / 新能源',
    projects: 3,
    meetings: 22,
    health: 84.8,
    funded: 2,
    score: 88.2,
    rank: 2,
  },
  {
    name: '赵导师',
    area: 'AI / 大模型应用',
    projects: 3,
    meetings: 25,
    health: 82.5,
    funded: 1,
    score: 85.6,
    rank: 3,
  },
  {
    name: '王导师',
    area: '消费品牌',
    projects: 2,
    meetings: 14,
    health: 79.0,
    funded: 0,
    score: 78.4,
    rank: 4,
  },
];

const BATCHES = [
  { key: '2025-Spring', label: '2025春' },
  { key: '2025-Fall', label: '2025秋' },
  { key: '2026-Spring', label: '2026春' },
];

const METRIC_CARDS = [
  { key: 'applications', label: '申请数', icon: Target, suffix: '个' },
  { key: 'accepted', label: '入营数', icon: Rocket, suffix: '个' },
  { key: 'graduated', label: '结业数', icon: GraduationCap, suffix: '个' },
  { key: 'funded', label: '获投数', icon: Banknote, suffix: '个' },
  { key: 'fundedRate', label: '获投率', icon: TrendingUp, suffix: '%' },
  { key: 'avgFunding', label: '平均融资额', icon: PieChart, suffix: '万' },
  { key: 'mentors', label: '导师数', icon: Users, suffix: '位' },
  { key: 'freq', label: '平均辅导频次', icon: Calendar, suffix: '次/周' },
];

const BATCH_COMPARISON: Record<
  string,
  Record<string, number | null>
> = {
  '2025-Spring': {
    applications: 9,
    accepted: 6,
    graduated: 5,
    funded: 2,
    fundedRate: 33.3,
    avgFunding: 1800,
    mentors: 5,
    freq: 1.2,
  },
  '2025-Fall': {
    applications: 14,
    accepted: 7,
    graduated: 7,
    funded: 3,
    fundedRate: 42.9,
    avgFunding: 2600,
    mentors: 6,
    freq: 1.6,
  },
  '2026-Spring': {
    applications: 12,
    accepted: 8,
    graduated: 6,
    funded: 3,
    fundedRate: 37.5,
    avgFunding: 3200,
    mentors: 7,
    freq: 1.8,
  },
};

const CHART_COMPARISON = [
  { name: '2025春', 申请数: 9, 入营数: 6, 获投数: 2, 总融资额: 360 },
  { name: '2025秋', 申请数: 14, 入营数: 7, 获投数: 3, 总融资额: 780 },
  { name: '2026春', 申请数: 12, 入营数: 8, 获投数: 3, 总融资额: 960 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('funnel');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([
    '2025-Spring',
    '2025-Fall',
    '2026-Spring',
  ]);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 24 },
    },
  };

  const toggleBatch = (key: string) => {
    setSelectedBatches((prev) =>
      prev.includes(key)
        ? prev.length > 1
          ? prev.filter((b) => b !== key)
          : prev
        : [...prev, key],
    );
  };

  const renderFunnel = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {FUNNEL_DATA.map((item, idx) => (
          <StatCard
            key={item.label}
            icon={idx === 0 ? Target : idx === 4 ? Banknote : Rocket}
            title={item.label}
            value={item.value}
            subtitle={`绝对转化 ${item.absoluteRate}%`}
            trend={{
              value: `环节转化 ${item.relativeRate}%`,
              positive: item.relativeRate >= 70,
            }}
            gradient={
              idx === 0
                ? 'indigo'
                : idx === 1
                  ? 'violet'
                  : idx === 2
                    ? 'emerald'
                    : idx === 3
                      ? 'amber'
                      : 'slate'
            }
          />
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">转化漏斗全景</CardTitle>
                <CardDescription>
                  从申请到获投的全链路转化分析
                </CardDescription>
              </div>
              <Badge variant="indigo" className="text-xs px-2.5 py-1">
                整体转化率 {FUNNEL_DATA[FUNNEL_DATA.length - 1].absoluteRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsFunnelChart>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'value') return [`${value} 个`, '数量'];
                      if (name === 'absoluteRate') return [`${value}%`, '绝对转化率'];
                      return [`${value}%`, '环节转化率'];
                    }}
                  />
                  <Funnel
                    data={FUNNEL_DATA}
                    dataKey="value"
                    isAnimationActive
                  >
                    <LabelList
                      position="right"
                      fill="#0f172a"
                      stroke="none"
                      dataKey="value"
                      formatter={(v: number) => `${v} 个`}
                    />
                    <LabelList
                      position="left"
                      fill="#334155"
                      stroke="none"
                      dataKey="label"
                      fontSize={13}
                      fontWeight={500}
                    />
                  </Funnel>
                </RechartsFunnelChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {FUNNEL_DATA.map((item, idx) => (
                <div key={item.label} className="text-center">
                  <div
                    className="h-1.5 rounded-full mb-1.5"
                    style={{ backgroundColor: item.fill }}
                  />
                  <p className="text-[10px] text-slate-500">
                    相对转化 {item.relativeRate}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">按行业维度的转化对比</CardTitle>
            <CardDescription>各行业在各阶段的项目数量分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-3 text-left text-xs font-medium text-slate-500">
                      行业
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      申请
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      初审
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      入营
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      融资对接
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      获投
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium text-slate-500">
                      获投率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {INDUSTRY_CONVERSION.map((row) => {
                    const rate = row.apply > 0 ? (row.funded / row.apply) * 100 : 0;
                    return (
                      <tr
                        key={row.industry}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-900">
                            {row.industry}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {row.apply}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                            {row.pass}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">
                            {row.inBatch}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                            {row.match}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                            {row.funded}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={cn(
                              'font-semibold',
                              rate >= 30
                                ? 'text-emerald-600'
                                : rate >= 15
                                  ? 'text-amber-600'
                                  : 'text-slate-500',
                            )}
                          >
                            {rate.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderMentor = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">导师效能雷达图</CardTitle>
                <CardDescription>五位核心导师的综合能力对比</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-600">赵导师</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">陈导师</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">李导师</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={MENTOR_RADAR}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 12, fill: '#475569' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Radar
                    name="赵导师"
                    dataKey="赵导师"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="陈导师"
                    dataKey="陈导师"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="李导师"
                    dataKey="李导师"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">导师绩效排行榜</CardTitle>
            <CardDescription>按综合得分排名</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-3 text-left text-xs font-medium text-slate-500 w-16">
                      排名
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-slate-500">
                      导师
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-slate-500">
                      专注领域
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      带项目
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      辅导次数
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      平均健康度
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                      所带获投
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium text-slate-500">
                      综合得分
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MENTOR_TABLE.map((m) => (
                    <tr
                      key={m.name}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center">
                          <span
                            className={cn(
                              'font-display text-xl font-bold',
                              m.rank === 1
                                ? 'text-amber-500'
                                : m.rank === 2
                                  ? 'text-slate-500'
                                  : m.rank === 3
                                    ? 'text-orange-600'
                                    : 'text-slate-400',
                            )}
                          >
                            {m.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-semibold text-slate-700">
                            {m.name[0]}
                          </div>
                          <span className="font-medium text-slate-900">
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-slate-600">{m.area}</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">
                        {m.projects}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">
                        {m.meetings}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                              style={{ width: `${m.health}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-emerald-600">
                            {m.health}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={m.funded > 0 ? 'emerald' : 'slate'}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {m.funded} 个
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-display text-lg font-bold text-indigo-600">
                          {m.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderComparison = () => {
    const sortedBatches = selectedBatches.sort();

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setBatchDropdownOpen(!batchDropdownOpen)}
              className="gap-2"
            >
              <span className="text-sm">
                已选择 {selectedBatches.length} 期进行对比
              </span>
              {batchDropdownOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </Button>

            {batchDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2"
              >
                {BATCHES.map((b) => {
                  const selected = selectedBatches.includes(b.key);
                  return (
                    <button
                      key={b.key}
                      onClick={() => toggleBatch(b.key)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        selected
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <span>{b.label}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {sortedBatches.map((k) => {
              const meta = BATCHES.find((b) => b.key === k)!;
              return (
                <Badge key={k} variant="indigo" className="text-[10px] px-2 py-0.5">
                  {meta.label}
                </Badge>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {METRIC_CARDS.map((card, idx) => {
            const values = sortedBatches.map((k) => ({
              batch: k,
              label: BATCHES.find((b) => b.key === k)!.label,
              value: BATCH_COMPARISON[k][card.key] as number,
            }));

            const latest = values[values.length - 1];
            const previous = values.length >= 2 ? values[values.length - 2] : null;
            const change =
              previous && previous.value && latest.value
                ? ((latest.value - previous.value) / previous.value) * 100
                : 0;

            return (
              <Card
                key={card.key}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <card.icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {card.label}
                      </span>
                    </div>
                    {previous && (
                      <div
                        className={cn(
                          'flex items-center gap-0.5 text-xs font-medium',
                          change >= 0 ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {change.toFixed(0)}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {values.map((v, vi) => (
                      <div
                        key={v.batch}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] text-slate-500">
                          {v.label}
                        </span>
                        <span
                          className={cn(
                            'font-semibold',
                            vi === values.length - 1
                              ? 'text-slate-900 text-base'
                              : 'text-slate-500 text-sm',
                          )}
                        >
                          {v.value != null ? v.value : '-'}
                          {card.suffix && v.value != null && (
                            <span className="text-[10px] text-slate-400 ml-0.5 font-normal">
                              {card.suffix}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-1">
                    {values.map((v, vi) => {
                      const maxVal = Math.max(
                        ...values.map((x) => Number(x.value) || 0),
                      );
                      const pct =
                        maxVal > 0
                          ? ((Number(v.value) || 0) / maxVal) * 100
                          : 0;
                      const colors = [
                        'bg-slate-300',
                        'bg-violet-400',
                        'bg-indigo-500',
                      ];
                      return (
                        <div
                          key={v.batch}
                          className="flex-1 h-4 rounded-md bg-slate-100 overflow-hidden"
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.6,
                              delay: 0.05 * idx + 0.05 * vi,
                            }}
                            className={cn(
                              'h-full rounded-md',
                              colors[vi % colors.length],
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">关键指标对比</CardTitle>
                  <CardDescription>
                    各期核心数据并列柱状图对比
                  </CardDescription>
                </div>
                <Badge variant="indigo" className="text-xs px-2.5 py-1">
                  {sortedBatches.length} 期对比
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CHART_COMPARISON.filter((d) =>
                      sortedBatches.some(
                        (b) =>
                          d.name ===
                          BATCHES.find((x) => x.key === b)?.label,
                      ),
                    )}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#475569' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="申请数"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="入营数"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="获投数"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="总融资额"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <PageContainer
      title="运营数据总览"
      subtitle="加速器全周期运营分析与洞察"
      actions={
        <Button variant="outline" size="sm" icon={<BarChart2 className="h-4 w-4" />}>
          导出报表
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="relative">
          <div className="flex gap-1 p-1 rounded-2xl bg-slate-100/80 backdrop-blur-sm overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center',
                  activeTab === tab.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                )}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'funnel' && renderFunnel()}
            {activeTab === 'mentor' && renderMentor()}
            {activeTab === 'comparison' && renderComparison()}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

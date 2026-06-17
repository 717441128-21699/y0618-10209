import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Activity,
  ChevronDown,
  Download,
  Bell,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/common';
import { TrendLineChart } from '@/components/charts';
import { useHealthStore } from '@/stores/healthStore';
import { useApplicationStore } from '@/stores/applicationStore';
import { cn } from '@/lib/utils';

const BATCH_OPTIONS = [
  { value: '2026-Spring', label: '2026春季加速营' },
  { value: '2026-Winter', label: '2025冬季加速营' },
  { value: '2025-Fall', label: '2025秋季加速营' },
];

const ALL_INDUSTRIES = [
  '全部行业',
  '人工智能',
  '新能源',
  '医疗健康',
  '企业服务',
  '硬件',
  '农业科技',
  '物流',
  '教育科技',
];

interface ProjectHealthRow {
  projectId: string;
  projectName: string;
  industry: string;
  currentUsers: number;
  prevUsers: number;
  currentRevenue: number;
  prevRevenue: number;
  fundingProgress: number;
  lastUpdated: string;
  daysSinceUpdate: number;
  status: 'green' | 'yellow' | 'red';
}

function generateWeeklyData(
  baseValue: number,
  volatility: number,
  trend: number,
  weeks = 12,
): { date: string; value: number }[] {
  const result: { date: string; value: number }[] = [];
  let val = baseValue;
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = `W${Math.ceil(d.getDate() / 7)}`;
    const month = d.getMonth() + 1;
    const change = (Math.random() - 0.5) * volatility + trend;
    val = Math.max(0, Math.round(val + change));
    result.push({
      date: `${month}/${wk}`,
      value: val,
    });
  }
  return result;
}

const BASE_PROJECT_DATA = [
  { name: '智云AI助手', industry: '人工智能', users: 2400, revenue: 86, funding: 62 },
  { name: '绿能新材', industry: '新能源', users: 580, revenue: 240, funding: 45 },
  { name: '健行医疗', industry: '医疗健康', users: 120, revenue: 58, funding: 38 },
  { name: '云原生数据库', industry: '企业服务', users: 320, revenue: 180, funding: 88 },
  { name: '消费级AR眼镜', industry: '硬件', users: 8600, revenue: 520, funding: 75 },
  { name: '零碳物流', industry: '物流', users: 3800, revenue: 165, funding: 50 },
  { name: '智慧农业', industry: '农业科技', users: 2100, revenue: 92, funding: 32 },
  { name: '教育AI助教', industry: '教育科技', users: 15000, revenue: 120, funding: 28 },
];

export default function HealthDashboardPage() {
  const navigate = useNavigate();
  const metrics = useHealthStore((s) => s.metrics);
  const applications = useApplicationStore((s) => s.applications);
  const [currentBatch, setCurrentBatch] = useState('2026-Spring');
  const [selectedIndustry, setSelectedIndustry] = useState('全部行业');
  const [industryOpen, setIndustryOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const userTrend = useMemo(() => generateWeeklyData(15000, 2000, 800), []);
  const revenueTrend = useMemo(() => generateWeeklyData(800, 120, 45), []);
  const fundingTrend = useMemo(() => generateWeeklyData(40, 4, 2.5), []);

  const stats = useMemo(() => {
    const projects = BASE_PROJECT_DATA.filter(
      (p) => selectedIndustry === '全部行业' || p.industry === selectedIndustry,
    );
    const totalUsers = projects.reduce((a, b) => a + b.users, 0);
    const totalRevenue = projects.reduce((a, b) => a + b.revenue, 0);
    const avgFunding =
      projects.length > 0
        ? Math.round(projects.reduce((a, b) => a + b.funding, 0) / projects.length)
        : 0;
    return {
      totalUsers,
      userGrowth: 12.5,
      totalRevenue,
      revenueGrowth: 8.3,
      avgFunding,
    };
  }, [selectedIndustry]);

  const rows = useMemo<ProjectHealthRow[]>(() => {
    const now = Date.now();
    const projectMetrics = new Map<string, { latest: typeof metrics[0]; days: number }>();

    for (const m of metrics) {
      const ts = new Date(m.recordedAt).getTime();
      const days = Math.floor((now - ts) / (24 * 60 * 60 * 1000));
      const existing = projectMetrics.get(m.projectId);
      if (!existing || ts > new Date(existing.latest.recordedAt).getTime()) {
        projectMetrics.set(m.projectId, { latest: m, days });
      }
    }

    const appMap = new Map<string, { industry: string; status: string }>();
    for (const a of applications) {
      appMap.set(a.id, { industry: a.industry, status: a.status });
    }

    const result: ProjectHealthRow[] = BASE_PROJECT_DATA.map((p, idx) => {
      const existing = metrics.find((m) => m.projectName === p.name);
      const matched = Array.from(projectMetrics.values()).find(
        (v) => v.latest.projectName === p.name,
      );
      const baseDays = [2, 5, 12, 3, 8, 15, 6, 11];
      const days = matched?.days ?? baseDays[idx] ?? 5;
      const status: 'green' | 'yellow' | 'red' =
        days <= 7 ? 'green' : days <= 10 ? 'yellow' : 'red';
      const date = new Date(now - days * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      return {
        projectId: existing?.projectId || `p${idx + 1}`,
        projectName: p.name,
        industry: p.industry,
        currentUsers: p.users,
        prevUsers: Math.round(p.users * (0.85 + Math.random() * 0.1)),
        currentRevenue: p.revenue,
        prevRevenue: Math.round(p.revenue * (0.88 + Math.random() * 0.08)),
        fundingProgress: p.funding,
        lastUpdated: dateStr,
        daysSinceUpdate: days,
        status,
      };
    });

    return result.filter(
      (r) => selectedIndustry === '全部行业' || r.industry === selectedIndustry,
    );
  }, [metrics, applications, selectedIndustry]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
  };

  const batchLabel = BATCH_OPTIONS.find((b) => b.value === currentBatch)?.label || BATCH_OPTIONS[0].label;

  const changePct = (cur: number, prev: number) => {
    if (prev === 0) return 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  const rowBg = (status: ProjectHealthRow['status']) => {
    if (status === 'green') return 'hover:bg-emerald-50/70';
    if (status === 'yellow') return 'bg-amber-50/50 hover:bg-amber-50/80';
    return 'bg-red-50/50 hover:bg-red-50/80';
  };

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <PageContainer
      title="项目健康度看板"
      subtitle={`数据更新截止：本周一 · ${batchLabel}`}
      actions={
        <>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            导出周报
          </Button>
          <Button variant="secondary" className="gap-2">
            <Bell className="h-4 w-4" />
            批量催更
            {rows.filter((r) => r.status !== 'green').length > 0 && (
              <span className="ml-1 -mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {rows.filter((r) => r.status !== 'green').length}
              </span>
            )}
          </Button>
        </>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={cardVariants}>
          <Card className="border-slate-200">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">筛选：</span>
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="gap-2 pr-3 h-9"
                    size="sm"
                  >
                    <span>{batchLabel}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-500 transition-transform',
                        batchOpen && 'rotate-180',
                      )}
                    />
                  </Button>
                  {batchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                      <div className="p-1.5">
                        {BATCH_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setCurrentBatch(opt.value);
                              setBatchOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm',
                              currentBatch === opt.value
                                ? 'bg-indigo-50 font-semibold text-indigo-700'
                                : 'text-slate-700 hover:bg-slate-50',
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setIndustryOpen(!industryOpen)}
                    className="gap-2 pr-3 h-9"
                    size="sm"
                  >
                    <span>{selectedIndustry}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-500 transition-transform',
                        industryOpen && 'rotate-180',
                      )}
                    />
                  </Button>
                  {industryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                      <div className="p-1.5 max-h-72 overflow-y-auto">
                        {ALL_INDUSTRIES.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSelectedIndustry(opt);
                              setIndustryOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm',
                              selectedIndustry === opt
                                ? 'bg-indigo-50 font-semibold text-indigo-700'
                                : 'text-slate-700 hover:bg-slate-50',
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex-1" />

                <Button variant="ghost" size="sm" className="gap-1.5 h-9">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs">刷新数据</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <Card className="overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-50 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">总用户数</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {stats.totalUsers.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                        stats.userGrowth >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700',
                      )}
                    >
                      {stats.userGrowth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stats.userGrowth >= 0 ? '+' : ''}
                      {stats.userGrowth}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">所有项目用户数之和 · 周环比</p>
                </div>
              </div>
              <TrendLineChart
                data={userTrend}
                color="indigo"
                height={140}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-50 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">总月营收（万元）</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {stats.totalRevenue.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                        stats.revenueGrowth >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700',
                      )}
                    >
                      {stats.revenueGrowth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stats.revenueGrowth >= 0 ? '+' : ''}
                      {stats.revenueGrowth}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">所有项目营收之和 · 周环比</p>
                </div>
              </div>
              <TrendLineChart
                data={revenueTrend}
                color="emerald"
                height={140}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-50 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                      <Activity className="h-5 w-5 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">平均融资进度</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {stats.avgFunding}%
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-violet-50 text-violet-700">
                      <TrendingUp className="h-3 w-3" />
                      +3.2pp
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">各项目融资进度平均</p>
                </div>
              </div>
              <div className="h-140">
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>目标完成度</span>
                    <span className="font-semibold text-violet-700">{stats.avgFunding}%</span>
                  </div>
                  <div className="h-3 bg-violet-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.avgFunding}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
                <TrendLineChart
                  data={fundingTrend}
                  color="violet"
                  height={90}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">用户数趋势（12周）</CardTitle>
              <CardDescription>全量项目累计用户增长</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={userTrend} color="indigo" height={180} unit="" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">月营收趋势（12周）</CardTitle>
              <CardDescription>单位：万元</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={revenueTrend} color="emerald" height={180} unit="" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">融资进度趋势（12周）</CardTitle>
              <CardDescription>平均完成度百分比</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={fundingTrend} color="violet" height={180} unit="%" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base">团队状态总览</CardTitle>
                  <CardDescription>
                    共 {rows.length} 个项目 · 已选 {selectedProjects.size} 个
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">
                    绿灯 {rows.filter((r) => r.status === 'green').length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600">
                    黄灯 {rows.filter((r) => r.status === 'yellow').length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-slate-600">
                    红灯 {rows.filter((r) => r.status === 'red').length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs text-slate-500 font-medium">
                      <th className="py-3 pl-5 pr-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedProjects.size === rows.length && rows.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(new Set(rows.map((r) => r.projectId)));
                            } else {
                              setSelectedProjects(new Set());
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="py-3 px-3 w-[22%]">项目</th>
                      <th className="py-3 px-3 w-[14%]">用户数</th>
                      <th className="py-3 px-3 w-[14%]">月营收(万)</th>
                      <th className="py-3 px-3 w-[12%]">融资进度</th>
                      <th className="py-3 px-3 w-[14%]">最后更新</th>
                      <th className="py-3 px-3 w-[10%]">状态</th>
                      <th className="py-3 pl-3 pr-5 w-[14%] text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const userDelta = changePct(r.currentUsers, r.prevUsers);
                      const revDelta = changePct(r.currentRevenue, r.prevRevenue);
                      const isHover = hoverRowId === r.projectId;
                      return (
                        <tr
                          key={r.projectId}
                          className={cn(
                            'border-b border-slate-100 last:border-0 transition-colors group',
                            rowBg(r.status),
                          )}
                          onMouseEnter={() => setHoverRowId(r.projectId)}
                          onMouseLeave={() => setHoverRowId(null)}
                        >
                          <td className="py-3 pl-5 pr-3">
                            <input
                              type="checkbox"
                              checked={selectedProjects.has(r.projectId)}
                              onChange={() => toggleProject(r.projectId)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-2.5">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 truncate">
                                  {r.projectName}
                                </div>
                                <div className="mt-1">
                                  <Badge
                                    variant="violet"
                                    className="text-[10.5px] px-2 py-0"
                                  >
                                    {r.industry}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">
                              {r.currentUsers.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              上周 {r.prevUsers.toLocaleString()}
                            </div>
                            <div
                              className={cn(
                                'text-[11px] font-bold mt-0.5 inline-flex items-center gap-0.5',
                                userDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
                              )}
                            >
                              {userDelta >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {userDelta >= 0 ? '+' : ''}
                              {userDelta}%
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">
                              {r.currentRevenue.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              上周 {r.prevRevenue.toLocaleString()}
                            </div>
                            <div
                              className={cn(
                                'text-[11px] font-bold mt-0.5 inline-flex items-center gap-0.5',
                                revDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
                              )}
                            >
                              {revDelta >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {revDelta >= 0 ? '+' : ''}
                              {revDelta}%
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden min-w-[60px]">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    r.fundingProgress >= 70
                                      ? 'bg-emerald-500'
                                      : r.fundingProgress >= 40
                                        ? 'bg-amber-500'
                                        : 'bg-violet-500',
                                  )}
                                  style={{ width: `${r.fundingProgress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700 tabular-nums min-w-[34px]">
                                {r.fundingProgress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-sm text-slate-700 font-medium">
                              {r.lastUpdated}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {r.daysSinceUpdate} 天前
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base leading-none">
                                {r.status === 'green'
                                  ? '🟢'
                                  : r.status === 'yellow'
                                    ? '🟡'
                                    : '🔴'}
                              </span>
                              {r.status === 'red' && (
                                <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                                  逾期
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right">
                            <div
                              className={cn(
                                'inline-flex items-center gap-2 transition-opacity',
                                isHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                              )}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1 px-2.5"
                                onClick={() => navigate(`/health/${r.projectId}`)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                详情
                              </Button>
                              {r.status !== 'green' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 text-xs gap-1 px-2.5"
                                >
                                  <Bell className="h-3.5 w-3.5" />
                                  催更
                                </Button>
                              )}
                            </div>
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
    </PageContainer>
  );
}

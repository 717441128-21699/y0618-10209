import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  Target,
  Rocket,
  Banknote,
  GraduationCap,
  ListTodo,
  Zap,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  Badge,
} from '@/components/common';
import { FunnelChart, ProgressBars } from '@/components/charts';
import { TodoList, QuickActions } from '@/components/features/dashboard';
import { useApplicationStore } from '@/stores/applicationStore';
import { useMentoringStore } from '@/stores/mentoringStore';
import { useHealthStore } from '@/stores/healthStore';
import { useDemoDayStore } from '@/stores/demoDayStore';
import { cn } from '@/lib/utils';

const BATCH_OPTIONS = [
  { value: '2026-Spring', label: '2026春季加速营' },
  { value: '2026-Winter', label: '2025冬季加速营' },
  { value: '2025-Fall', label: '2025秋季加速营' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [batchOpen, setBatchOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState('2026-Spring');

  const applications = useApplicationStore((s) => s.applications);
  const assignments = useMentoringStore((s) => s.assignments);
  const meetingNotes = useMentoringStore((s) => s.meetingNotes);
  const healthMetrics = useHealthStore((s) => s.metrics);
  const demoDay = useDemoDayStore((s) => s.getCurrentDemoDay());

  const stats = useMemo(() => {
    const batchApps = applications.filter((a) => a.batch === currentBatch);
    const totalApps = Math.max(batchApps.length, 12);

    const inBatch = batchApps.filter((a) =>
      ['accepted', 'in_batch', 'graduated'].includes(a.status),
    );
    const inBatchCount = Math.max(inBatch.length, 8);

    const funded = batchApps.filter((a) =>
      ['Pre-A轮', 'A轮', 'B轮', 'C轮'].includes(a.stage),
    );
    const fundedCount = Math.max(funded.length, 3);

    const activeMentors = new Set(
      assignments
        .filter((a) => a.status === 'active')
        .map((a) => a.mentorId),
    );
    const mentorCount = Math.max(activeMentors.size, 3);

    const matchedProjects = new Set(
      assignments.map((a) => a.projectId),
    );
    const matchRate =
      inBatchCount > 0
        ? Math.min(100, Math.round((matchedProjects.size / inBatchCount) * 100))
        : 100;

    const conversionRate =
      inBatchCount > 0 ? Math.round((fundedCount / inBatchCount) * 100) : 37.5;

    const weeklyFrequency =
      mentorCount > 0
        ? (meetingNotes.length / Math.max(mentorCount, 1) / 12).toFixed(1)
        : '1.8';

    return {
      totalApps,
      inBatchCount,
      fundedCount,
      mentorCount,
      matchRate,
      conversionRate,
      weeklyFrequency: weeklyFrequency === 'NaN' ? '1.8' : weeklyFrequency,
    };
  }, [applications, assignments, meetingNotes, currentBatch]);

  const funnelData = useMemo(() => [
    { label: '申请', value: stats.totalApps, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { label: '初审通过', value: 8, color: 'bg-gradient-to-r from-violet-500 to-violet-600' },
    { label: '入营', value: stats.inBatchCount, color: 'bg-gradient-to-r from-teal-500 to-teal-600' },
    { label: '融资对接', value: 5, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
    { label: '已获投', value: stats.fundedCount, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
  ], [stats]);

  const progressItems = useMemo(() => {
    const inBatchProjects = applications
      .filter((a) => ['accepted', 'in_batch', 'graduated'].includes(a.status))
      .slice(0, 8);

    const healthScores = new Map<string, number>();
    for (const m of healthMetrics) {
      const existing = healthScores.get(m.projectId);
      if (!existing || m.overallScore > existing) {
        healthScores.set(m.projectId, m.overallScore);
      }
    }

    const defaults = [
      { name: '智云AI助手', progress: 85 },
      { name: '绿能新材', progress: 72 },
      { name: '健行医疗', progress: 65 },
      { name: '云原生数据库', progress: 92 },
      { name: '消费级AR眼镜', progress: 78 },
      { name: '零碳物流', progress: 68 },
      { name: '智慧农业', progress: 45 },
      { name: '教育AI助教', progress: 30 },
    ];

    if (inBatchProjects.length >= 2) {
      return inBatchProjects.map((p, i) => {
        const defaultItem = defaults[i] || defaults[defaults.length - 1];
        const score = healthScores.get(p.id);
        return {
          name: p.projectName,
          progress: score != null ? Math.round(score * 0.8 + Math.random() * 20) : defaultItem.progress,
        };
      }).concat(defaults.slice(inBatchProjects.length)).slice(0, 8);
    }

    return defaults;
  }, [applications, healthMetrics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
  };

  const currentBatchLabel =
    BATCH_OPTIONS.find((b) => b.value === currentBatch)?.label || BATCH_OPTIONS[0].label;

  return (
    <PageContainer
      title="运营工作台"
      subtitle={`${currentBatchLabel} · 第12周`}
      actions={
        <>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setBatchOpen(!batchOpen)}
              className="gap-2 pr-3"
            >
              <span className="text-sm">{currentBatchLabel}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-500 transition-transform duration-200',
                  batchOpen && 'rotate-180',
                )}
              />
            </Button>

            {batchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
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
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        currentBatch === opt.value
                          ? 'bg-indigo-50 font-semibold text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <span>{opt.label}</span>
                      {currentBatch === opt.value && (
                        <Badge variant="indigo" className="text-[10px] px-1.5 py-0">
                          当前
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <Button
            onClick={() => navigate('/applications/new')}
            className="gap-2 shadow-md shadow-indigo-200/50"
          >
            <Plus className="h-4 w-4" />
            新建申请
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
        <motion.div
          variants={cardVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={Target}
            title="本期申请数"
            value={stats.totalApps}
            subtitle="覆盖7大赛道"
            trend={{ value: '同比 +33%', positive: true }}
            gradient="indigo"
            className="cursor-default"
          />
          <StatCard
            icon={Rocket}
            title="在营项目"
            value={stats.inBatchCount}
            subtitle={`导师配对率 ${stats.matchRate}%`}
            trend={{ value: '配对率 100%', positive: true }}
            gradient="emerald"
            className="cursor-default"
          />
          <StatCard
            icon={Banknote}
            title="已获融资项目"
            value={stats.fundedCount}
            subtitle={`融资转化率 ${stats.conversionRate}%`}
            trend={{ value: `转化 ${stats.conversionRate}%`, positive: true }}
            gradient="amber"
            className="cursor-default"
          />
          <StatCard
            icon={GraduationCap}
            title="活跃导师"
            value={stats.mentorCount}
            subtitle={`人均辅导 ${stats.weeklyFrequency}次/周`}
            trend={{ value: `${stats.weeklyFrequency} 次/周`, positive: true }}
            gradient="slate"
            className="cursor-default"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <ListTodo className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">待办事项</CardTitle>
                    <CardDescription>
                      需要关注和处理的运营任务
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="indigo" className="text-xs px-2.5 py-1">
                  4 项待办
                </Badge>
              </CardHeader>
              <CardContent>
                <TodoList />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">快捷入口</CardTitle>
                    <CardDescription>常用功能一键直达</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">转化漏斗</CardTitle>
                    <CardDescription>
                      从申请到获投的全链路转化
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="indigo" className="text-xs px-2.5 py-1">
                  整体转化 {((stats.fundedCount / stats.totalApps) * 100).toFixed(1)}%
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                <FunnelChart
                  data={funnelData}
                  className="py-2"
                  showPercentage
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">项目进展分布</CardTitle>
                    <CardDescription>
                      {progressItems.length} 个在营项目进度概览
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="emerald" className="text-xs px-2.5 py-1">
                  平均{' '}
                  {Math.round(
                    progressItems.reduce((a, b) => a + b.progress, 0) /
                      progressItems.length,
                  )}
                  %
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                <ProgressBars items={progressItems} barHeight={10} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {demoDay && (
          <motion.div variants={cardVariants}>
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white">
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="relative p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        即将到来
                      </Badge>
                      <span className="text-xs text-white/70">
                        {demoDay.location}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {demoDay.name}
                    </h3>
                    {demoDay.description && (
                      <p className="text-sm text-white/80 max-w-xl">
                        {demoDay.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/demo-day')}
                    className="bg-white/95 text-indigo-700 hover:bg-white shadow-lg shadow-indigo-900/20 self-start sm:self-auto"
                  >
                    查看详情 →
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}

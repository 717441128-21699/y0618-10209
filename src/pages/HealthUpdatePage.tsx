import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Activity,
  Calendar as CalendarIcon,
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle2,
  Sparkles,
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

export default function HealthUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const metrics = useHealthStore((s) => s.metrics);
  const submitMetrics = useHealthStore((s) => s.submitMetrics);
  const applications = useApplicationStore((s) => s.applications);

  const projectInfo = useMemo(() => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      return {
        projectId: app.id,
        projectName: app.projectName,
        industry: app.industry,
      };
    }
    const fromMetrics = metrics.find((m) => m.projectId === id);
    if (fromMetrics) {
      return {
        projectId: fromMetrics.projectId,
        projectName: fromMetrics.projectName,
        industry: '未分类',
      };
    }
    return {
      projectId: id || 'app1',
      projectName: `项目 ${id?.slice(-4) || '未知'}`,
      industry: '未分类',
    };
  }, [id, applications, metrics]);

  const latest = useMemo(() => {
    const existing = metrics
      .filter((m) => m.projectId === projectInfo.projectId)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];

    if (existing) {
      const days = Math.floor(
        (Date.now() - new Date(existing.recordedAt).getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        days,
        users: Math.round((existing.overallScore * 30 + 200) * (0.9 + Math.random() * 0.2)),
        revenue: Math.round(existing.overallScore * 1.2 + 20),
        funding: Math.round(existing.overallScore * 0.7 + 5),
      };
    }
    return {
      days: 30,
      users: 0,
      revenue: 0,
      funding: 0,
    };
  }, [metrics, projectInfo.projectId]);

  const lastWeekUsers = latest.users;
  const lastWeekRevenue = latest.revenue;
  const lastWeekFunding = latest.funding;

  const [users, setUsers] = useState<number>(Math.round(lastWeekUsers * 1.08));
  const [revenue, setRevenue] = useState<number>(Math.round(lastWeekRevenue * 1.06));
  const [funding, setFunding] = useState<number>(
    Math.min(100, lastWeekFunding + Math.floor(Math.random() * 4) + 1),
  );
  const [notes, setNotes] = useState(
    '本周完成V2.1版本迭代，新签约2家KA客户，客户留存率环比提升5pp。供应链方面部分元器件交期延长，已开始寻找替代方案。',
  );
  const [submitting, setSubmitting] = useState(false);

  const daysRemaining = Math.max(0, 7 - latest.days);
  const isUrgent = latest.days > 5;

  const historyData = useMemo(() => {
    const baseUsers = lastWeekUsers;
    const baseRev = lastWeekRevenue;
    const baseFund = lastWeekFunding;
    const make = (base: number, vol: number, tr: number) => {
      const result: { date: string; value: number }[] = [];
      let val = base * 0.82;
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        result.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          value: Math.round(val),
        });
        val = val * (1 + tr / 100) + (Math.random() - 0.4) * vol;
      }
      result[result.length - 1].value = base;
      return result;
    };
    return {
      users: make(baseUsers, baseUsers * 0.08, 3),
      revenue: make(baseRev, baseRev * 0.06, 2),
      funding: make(baseFund, 2, 1.5),
    };
  }, [lastWeekUsers, lastWeekRevenue, lastWeekFunding]);

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

  const userDelta = lastWeekUsers > 0 ? Math.round(((users - lastWeekUsers) / lastWeekUsers) * 1000) / 10 : 0;
  const revDelta = lastWeekRevenue > 0 ? Math.round(((revenue - lastWeekRevenue) / lastWeekRevenue) * 1000) / 10 : 0;
  const fundDelta = funding - lastWeekFunding;

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitting(true);
    const overallScore = Math.round(
      (Math.min(100, userDelta + 50) + Math.min(100, revDelta + 50) + funding) / 3,
    );
    submitMetrics({
      projectId: projectInfo.projectId,
      projectName: projectInfo.projectName,
      overallScore: Math.max(40, Math.min(99, overallScore)),
      metrics: {
        teamHealth: 80 + Math.floor(Math.random() * 15),
        productProgress: Math.min(100, 65 + userDelta),
        marketFit: 70 + Math.floor(Math.random() * 20),
        financialHealth: Math.min(100, 60 + revDelta),
      },
      notes,
      recordedBy: 'admin',
    });
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    if (!isDraft) {
      navigate('/health');
    }
  };

  return (
    <PageContainer
      title="更新健康度数据"
      subtitle="每周项目运营数据上报"
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回看板
          </Button>
          <Badge variant="indigo" className="text-xs px-3 py-1">
            {projectInfo.projectName} · {projectInfo.industry}
          </Badge>
        </>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-5xl mx-auto"
      >
        <motion.div variants={cardVariants}>
          <Card
            className={cn(
              'overflow-hidden border-l-4',
              isUrgent
                ? 'border-l-red-500 bg-gradient-to-r from-red-50/60 to-white'
                : 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white',
            )}
          >
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
                      isUrgent ? 'bg-red-100' : 'bg-emerald-100',
                    )}
                  >
                    {isUrgent ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-800">
                        {isUrgent ? '需要尽快完成更新' : '数据更新状态良好'}
                      </span>
                      {isUrgent && (
                        <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                          即将截止
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        上次更新：{latest.days} 天前
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        距离截止还有：
                        <span
                          className={cn(
                            'font-semibold',
                            daysRemaining <= 1 ? 'text-red-600' : 'text-emerald-600',
                          )}
                        >
                          {daysRemaining} 天
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                    isUrgent
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700',
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  每周一前完成数据更新
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">用户数</CardTitle>
                      <CardDescription>平台累计注册用户总数</CardDescription>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                      userDelta >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700',
                    )}
                  >
                    {userDelta >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {userDelta >= 0 ? '+' : ''}
                    {userDelta}% 周环比
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center justify-between mb-2">
                      <span>当前用户数</span>
                      <span className="text-slate-400">
                        上周参考：{lastWeekUsers.toLocaleString()}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={users}
                        onChange={(e) => setUsers(Math.max(0, Number(e.target.value)))}
                        className="w-full h-12 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/30 to-white px-4 text-xl font-bold text-indigo-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition placeholder:text-slate-300"
                        placeholder="请输入用户数"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                        人
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      近 4 周趋势
                    </div>
                    <TrendLineChart
                      data={historyData.users}
                      color="indigo"
                      height={100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">月营收（万元）</CardTitle>
                      <CardDescription>本月预估营收总额</CardDescription>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                      revDelta >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700',
                    )}
                  >
                    {revDelta >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {revDelta >= 0 ? '+' : ''}
                    {revDelta}% 周环比
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center justify-between mb-2">
                      <span>本月营收（万元）</span>
                      <span className="text-slate-400">
                        上周参考：{lastWeekRevenue.toLocaleString()} 万元
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
                        className="w-full h-12 rounded-xl border-2 border-emerald-100 bg-gradient-to-r from-emerald-50/30 to-white px-4 text-xl font-bold text-emerald-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition placeholder:text-slate-300"
                        placeholder="请输入营收金额"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                        万元
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      近 4 周趋势
                    </div>
                    <TrendLineChart
                      data={historyData.revenue}
                      color="emerald"
                      height={100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                      <Activity className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">融资进度 %</CardTitle>
                      <CardDescription>本轮融资目标完成度</CardDescription>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                      fundDelta >= 0
                        ? 'bg-violet-50 text-violet-700'
                        : 'bg-amber-50 text-amber-700',
                    )}
                  >
                    {fundDelta >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {fundDelta >= 0 ? '+' : ''}
                    {fundDelta}pp
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-slate-500">
                        滑动调整进度
                      </label>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-violet-700">
                          {funding}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">%</span>
                      </div>
                    </div>
                    <div className="relative pt-1 pb-2">
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${funding}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={funding}
                        onChange={(e) => setFunding(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer top-0"
                      />
                      <div className="flex justify-between mt-2 text-[10px] text-slate-400 px-0.5">
                        <span>0%</span>
                        <span>上周：{lastWeekFunding}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      近 4 周趋势
                    </div>
                    <TrendLineChart
                      data={historyData.funding}
                      color="violet"
                      height={100}
                      unit="%"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">本周备注</CardTitle>
                    <CardDescription>可选填写本周进展亮点或问题</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="分享本周值得关注的进展，比如产品迭代里程碑、重要客户签约、团队变动、风险预警等..."
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 leading-relaxed resize-y focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition placeholder:text-slate-400"
                />
                <div className="mt-2 text-right text-[11px] text-slate-400">
                  {notes.length} 字
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 border-indigo-100">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">本周数据摘要</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      用户增长
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        userDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {userDelta >= 0 ? '+' : ''}
                      {users - lastWeekUsers >= 0 ? '+' : ''}
                      {(users - lastWeekUsers).toLocaleString()} 人
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      营收增长
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        revDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {revenue - lastWeekRevenue >= 0 ? '+' : ''}
                      {revenue - lastWeekRevenue} 万元
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-violet-500" />
                      融资进展
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        fundDelta >= 0 ? 'text-violet-600' : 'text-amber-600',
                      )}
                    >
                      {fundDelta >= 0 ? '+' : ''}
                      {fundDelta}pp
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/80">
                  <div className="text-[11px] text-slate-500 mb-2">综合健康度评分</div>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-indigo-700">
                      {Math.round(
                        (Math.min(100, userDelta + 50) +
                          Math.min(100, revDelta + 50) +
                          funding) /
                          3,
                      )}
                    </div>
                    <Badge variant="emerald" className="text-[10px] px-2 py-0.5">
                      数据完整 ✓
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">提交流程</CardTitle>
                    <CardDescription>确认后数据将同步至看板</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {[
                    { done: true, label: '用户数已填写' },
                    { done: true, label: '营收数据已填写' },
                    { done: true, label: '融资进度已选择' },
                    { done: notes.trim().length > 0, label: '本周备注已填写' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5',
                        step.done ? 'bg-emerald-50/60' : 'bg-slate-50',
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0',
                          step.done
                            ? 'bg-emerald-500'
                            : 'bg-slate-200',
                        )}
                      >
                        {step.done && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          step.done ? 'text-emerald-800' : 'text-slate-500',
                        )}
                      >
                        {step.label}
                      </span>
                      <span
                        className={cn(
                          'ml-auto text-[11px] font-semibold',
                          step.done ? 'text-emerald-600' : 'text-slate-400',
                        )}
                      >
                        {step.done ? '已完成' : '待完成'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={cardVariants}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent -mx-2 px-2 py-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleSubmit(true)}
              loading={submitting}
            >
              <Save className="h-4 w-4" />
              暂存草稿
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-indigo-200/60 sm:h-12 sm:px-6"
              size="lg"
              onClick={() => handleSubmit(false)}
              loading={submitting}
            >
              <Send className="h-4 w-4" />
              提交更新
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

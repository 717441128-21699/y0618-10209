import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Send,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Star,
  User,
  Building2,
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
import { useDemoDayStore } from '@/stores/demoDayStore';
import { cn } from '@/lib/utils';
import { mockApplications } from '@/mock/mockData';

type InterestLevel = 'low' | 'medium' | 'high' | 'must';

interface ScoreDimensions {
  team: number;
  market: number;
  product: number;
  value: number;
}

const DIMENSION_META: Record<
  keyof ScoreDimensions,
  {
    label: string;
    subLabel: string;
    icon: typeof Users;
    gradient: string;
    bg: string;
  }
> = {
  team: {
    label: '团队实力',
    subLabel: '完整性 · 互补性 · 执行力',
    icon: Users,
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
  },
  market: {
    label: '市场机会',
    subLabel: '规模 · 增速 · 痛点',
    icon: Target,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  product: {
    label: '产品创新',
    subLabel: '技术 · 体验 · 壁垒',
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  value: {
    label: '投后价值',
    subLabel: '协同 · 退出潜力 · 增长空间',
    icon: TrendingUp,
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
  },
};

const INTEREST_OPTIONS: {
  key: InterestLevel;
  label: string;
  description: string;
  color: string;
  border: string;
  dot: string;
}[] = [
  {
    key: 'low',
    label: '低兴趣',
    description: '继续观察',
    color: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  {
    key: 'medium',
    label: '中等兴趣',
    description: '后续跟进',
    color: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  {
    key: 'high',
    label: '高度关注',
    description: '约见深入沟通',
    color: 'text-violet-600',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
  {
    key: 'must',
    label: 'Must Have',
    description: '强烈推荐，必投项目',
    color: 'text-rose-600',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
];

const LOGO_COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-teal-500',
];

export default function DemoScorePage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const projectIdx = mockApplications.findIndex((a) => a.id === projectId);
  const project =
    projectIdx >= 0 ? mockApplications[projectIdx] : mockApplications[0];
  const logoColor = LOGO_COLORS[projectIdx >= 0 ? projectIdx % 8 : 0];

  const submitScore = useDemoDayStore((s) => s.submitScore);

  const [scores, setScores] = useState<ScoreDimensions>({
    team: 18,
    market: 16,
    product: 20,
    value: 15,
  });
  const [interest, setInterest] = useState<InterestLevel>('medium');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(
    () => scores.team + scores.market + scores.product + scores.value,
    [scores],
  );

  const isHighInterest = interest === 'high' || interest === 'must';
  const commentRequired = isHighInterest && comment.trim().length === 0;

  const highInterest = interest === 'high' || interest === 'must';

  const handleScoreChange = (dim: keyof ScoreDimensions, value: number) => {
    setScores((prev) => ({ ...prev, [dim]: value }));
  };

  const handleSubmit = () => {
    if (highInterest && comment.trim().length === 0) return;

    submitScore({
      demoDayId: 'dd1',
      projectId: project.id,
      projectName: project.projectName,
      judgeId: 'u7',
      judgeName: '钱投资人',
      scores: {
        innovation: scores.product,
        presentation: scores.team,
        marketPotential: scores.market,
        teamCapability: scores.team,
        traction: scores.value,
      },
      comment,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageContainer
        title="评分提交成功"
        subtitle="感谢您的专业评审"
        actions={
          <Button variant="outline" onClick={() => navigate('/demo-day')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            返回榜单
          </Button>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white p-8 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative mx-auto mb-4 h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <CheckCircle2 className="h-12 w-12" />
              </motion.div>
              <h2 className="relative text-2xl font-bold">评分已成功提交</h2>
              <p className="relative mt-2 text-white/80 text-sm">
                您的评分将与其他投资人的评分一起汇总至实时排行榜
              </p>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {(Object.keys(DIMENSION_META) as (keyof ScoreDimensions)[]).map(
                  (key) => {
                    const meta = DIMENSION_META[key];
                    return (
                      <div
                        key={key}
                        className={cn('p-3 rounded-xl text-center', meta.bg)}
                      >
                        <p className="text-xs text-slate-600 mb-1">
                          {meta.label}
                        </p>
                        <p className="font-display text-xl font-bold text-slate-900">
                          {scores[key]}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-xs text-slate-500">综合总分</p>
                  <p className="font-display text-3xl font-bold text-indigo-700">
                    {total}
                    <span className="text-base text-indigo-500 ml-1">/100</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">投资意向</p>
                  <Badge
                    variant={
                      interest === 'must'
                        ? 'danger'
                        : interest === 'high'
                          ? 'indigo'
                          : interest === 'medium'
                            ? 'info'
                            : 'slate'
                    }
                    className="text-xs px-3 py-1 mt-1"
                  >
                    {INTEREST_OPTIONS.find((o) => o.key === interest)?.label}
                  </Badge>
                </div>
              </div>

              {comment && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">评审评语</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {comment}
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/demo-day')}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  查看实时排行榜
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setSubmitted(false);
                    setScores({ team: 18, market: 16, product: 20, value: 15 });
                    setInterest('medium');
                    setComment('');
                  }}
                >
                  重新评分
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="现场评分"
      subtitle="投资人专业评审表单"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="indigo" className="text-xs px-3 py-1 h-7">
            {project.projectName}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate('/demo-day')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-indigo-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'h-16 w-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0',
                    logoColor,
                  )}
                >
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">
                    {project.projectName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                    {project.projectDescription}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="indigo" className="text-[10px] px-2 py-0.5">
                      {project.industry}
                    </Badge>
                    <Badge variant="slate" className="text-[10px] px-2 py-0.5">
                      {project.stage}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
                      <User className="h-3 w-3" />
                      <span>{project.founderName}</span>
                    </div>
                    <div className="flex -space-x-1.5 ml-1">
                      {[0, 1].map((i) => (
                        <div
                          key={i}
                          className="h-5 w-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-medium text-slate-600"
                        >
                          {project.founderName[i] || '创'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">四维评分 (0-25)</CardTitle>
                  <CardDescription>
                    每项权重25%，拖动滑块给出您的专业评分
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 mb-0.5">实时总分</p>
                  <motion.div
                    key={total}
                    initial={{ scale: 1.2, color: '#6366f1' }}
                    animate={{ scale: 1, color: total >= 80 ? '#059669' : total >= 60 ? '#d97706' : '#dc2626' }}
                    transition={{ duration: 0.4 }}
                    className="font-display text-4xl font-bold"
                  >
                    {total}
                  </motion.div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {(Object.keys(DIMENSION_META) as (keyof ScoreDimensions)[]).map(
                (key, idx) => {
                  const meta = DIMENSION_META[key];
                  const val = scores[key];
                  const percent = (val / 25) * 100;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 + idx * 0.08 }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-10 w-10 rounded-xl flex items-center justify-center',
                              meta.bg,
                            )}
                          >
                            <meta.icon className="h-5 w-5 text-slate-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">
                                {meta.label}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                25%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {meta.subLabel}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <motion.span
                            key={`${key}-${val}`}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className={cn(
                              'font-display text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                              meta.gradient,
                            )}
                          >
                            {val}
                          </motion.span>
                          <span className="text-xs text-slate-400">/25</span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.6, delay: 0.2 + idx * 0.08 }}
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r',
                              meta.gradient,
                            )}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={25}
                          step={1}
                          value={val}
                          onChange={(e) =>
                            handleScoreChange(key, parseInt(e.target.value))
                          }
                          className={cn(
                            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
                          )}
                        />
                        <motion.div
                          animate={{ left: `calc(${percent}% - 10px)` }}
                          transition={{ duration: 0.25, type: 'spring', stiffness: 350, damping: 30 }}
                          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 shadow-md pointer-events-none flex items-center justify-center"
                          style={{
                            borderColor:
                              key === 'team'
                                ? '#6366f1'
                                : key === 'market'
                                  ? '#10b981'
                                  : key === 'product'
                                    ? '#f59e0b'
                                    : '#f43f5e',
                          }}
                        />
                      </div>

                      <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">投资意向等级</CardTitle>
              <CardDescription>选择您对该项目的投资兴趣程度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interest === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setInterest(opt.key)}
                      className={cn(
                        'relative p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                        selected
                          ? cn(opt.border, 'bg-slate-50 shadow-sm')
                          : 'border-slate-200 hover:border-slate-300 bg-white',
                      )}
                    >
                      {selected && (
                        <motion.div
                          layoutId="interest-indicator"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            boxShadow:
                              opt.key === 'must'
                                ? 'inset 0 0 0 2px rgba(244,63,94,0.3)'
                                : opt.key === 'high'
                                  ? 'inset 0 0 0 2px rgba(139,92,246,0.3)'
                                  : opt.key === 'medium'
                                    ? 'inset 0 0 0 2px rgba(59,130,246,0.3)'
                                    : 'inset 0 0 0 2px rgba(148,163,184,0.3)',
                          }}
                        />
                      )}
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full flex-shrink-0',
                              opt.dot,
                              selected && 'animate-pulse',
                            )}
                          />
                          <span
                            className={cn(
                              'font-semibold text-sm',
                              selected ? opt.color : 'text-slate-700',
                            )}
                          >
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">评审评语</CardTitle>
                  <CardDescription>
                    留下您的专业建议和评价（
                    {isHighInterest ? (
                      <span className="text-rose-600 font-medium">高度关注时必填</span>
                    ) : (
                      '选填'
                    )}
                    ）
                  </CardDescription>
                </div>
                {commentRequired && (
                  <Badge variant="danger" className="text-[10px] flex items-center gap-1 px-2 py-0.5 h-6">
                    <AlertCircle className="h-3 w-3" />
                    请填写评语
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isHighInterest
                    ? '请详细说明您关注的亮点、投资逻辑、以及希望进一步了解的问题...'
                    : '可以写下您对项目的评价、建议、关注点...'
                }
                rows={5}
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 border-2 bg-slate-50/50 focus:bg-white focus:outline-none transition-all resize-none',
                  commentRequired
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
                )}
              />
              <div className="flex justify-between mt-2 text-[11px] text-slate-400">
                <span>建议 50-500 字</span>
                <span>{comment.length} 字</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="sticky bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent"
        >
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <Button
              variant="outline"
              fullWidth
              size="lg"
              icon={<Save className="h-4 w-4" />}
            >
              暂存评分
            </Button>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={<Send className="h-4 w-4" />}
              onClick={handleSubmit}
              disabled={commentRequired}
              className="shadow-lg shadow-indigo-200/50"
            >
              提交评分
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}

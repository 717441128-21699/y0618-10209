import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Save,
  Send,
  Plus,
  X,
  Award,
  Sparkles,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Slider,
  EmptyState,
} from '@/components/common';
import { useApplicationStore } from '@/stores/applicationStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateWeightedScore, isPassingScore, PASS_THRESHOLD } from '@/utils/score';
import { formatStatusChinese, getStatusBadgeVariant, formatCurrency } from '@/utils/format';
import type { ReviewScore, ReviewConclusion } from '@/types';
import { cn } from '@/lib/utils';

const STRENGTH_OPTIONS = [
  '团队背景强', '技术壁垒高', '市场空间大', '商业模式清晰',
  '早期数据验证', '增长趋势好', '产品差异化', '单位经济优秀',
  '团队执行力', '客户需求明确', '赛道天花板高', '创始人个人魅力',
];

const CONCERN_OPTIONS = [
  '竞争格局激烈', '商业化进度慢', '团队不完整', '技术风险',
  '监管政策风险', '用户增长放缓', '毛利偏低', '获客成本高',
  '单位经济模型未验证', '依赖单一大客户', '供应链风险', '估值偏高',
];

function Toast({ message, variant = 'success' }: { message: string; variant?: 'success' | 'info' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5',
        variant === 'success' && 'bg-emerald-600 text-white shadow-emerald-300/40',
        variant === 'info' && 'bg-slate-800 text-white shadow-slate-300/40',
      )}
    >
      <CheckCircle2 className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

export default function ReviewFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const reviewerId = currentUser?.id ?? 'u4';
  const reviewerName = currentUser?.name ?? '王评审';

  const getApplicationById = useApplicationStore((s) => s.getApplicationById);
  const updateApplicationStatus = useApplicationStore((s) => s.updateApplicationStatus);
  const application = id ? getApplicationById(id) : undefined;

  const { getReviewsByApplication, createReview, updateReview } = useReviewStore();

  const existingReviews = useMemo(() => (id ? getReviewsByApplication(id) : []), [id, getReviewsByApplication]);
  const myExistingReview = existingReviews.find((r) => r.reviewerId === reviewerId);

  const [toast, setToast] = useState<{ message: string; variant?: 'success' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [scores, setScores] = useState<ReviewScore>(() =>
    myExistingReview && myExistingReview.score > 0
      ? myExistingReview.criteriaScores
      : { team: 0, market: 0, product: 0, business: 0, funding: 0 },
  );
  const [strengths, setStrengths] = useState<string[]>(myExistingReview?.strengths ?? []);
  const [concerns, setConcerns] = useState<string[]>(myExistingReview?.concerns ?? []);
  const [customStrength, setCustomStrength] = useState('');
  const [customConcern, setCustomConcern] = useState('');
  const [comment, setComment] = useState(myExistingReview?.generalComment ?? myExistingReview?.comment ?? '');
  const [conclusion, setConclusion] = useState<ReviewConclusion | undefined>(myExistingReview?.conclusion);

  useEffect(() => {
    if (myExistingReview && myExistingReview.score > 0) {
      setScores(myExistingReview.criteriaScores);
      setStrengths(myExistingReview.strengths ?? []);
      setConcerns(myExistingReview.concerns ?? []);
      setComment(myExistingReview.generalComment ?? myExistingReview.comment ?? '');
      setConclusion(myExistingReview.conclusion);
    }
  }, [myExistingReview?.id]);

  const weightedScore = useMemo(() => calculateWeightedScore(scores), [scores]);
  const isPassing = isPassingScore(weightedScore);
  const completionPercent = useMemo(() => {
    const filled = Object.values(scores).filter((s) => s > 0).length;
    return Math.round((filled / 5) * 100);
  }, [scores]);

  const showToast = useCallback((message: string, variant?: 'success' | 'info') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const toggleTag = (type: 'strength' | 'concern', tag: string) => {
    if (type === 'strength') {
      setStrengths((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    } else {
      setConcerns((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      );
    }
  };

  const addCustomTag = (type: 'strength' | 'concern') => {
    const text = (type === 'strength' ? customStrength : customConcern).trim();
    if (!text) return;
    if (type === 'strength') {
      if (!STRENGTH_OPTIONS.includes(text) && !strengths.includes(text)) {
        setStrengths((prev) => [...prev, text]);
      }
      setCustomStrength('');
    } else {
      if (!CONCERN_OPTIONS.includes(text) && !concerns.includes(text)) {
        setConcerns((prev) => [...prev, text]);
      }
      setCustomConcern('');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (myExistingReview) {
        updateReview(myExistingReview.id, {
          criteriaScores: scores,
          score: weightedScore,
          comment,
          generalComment: comment,
          strengths,
          concerns,
          conclusion,
          status: 'pending',
        });
      } else if (id) {
        createReview({
          applicationId: id,
          reviewerId,
          reviewerName,
          criteriaScores: scores,
          score: weightedScore,
          comment,
          generalComment: comment,
          strengths,
          concerns,
          conclusion,
          status: 'pending',
        });
      }
      showToast('草稿保存成功', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!conclusion) {
      showToast('请选择评审结论', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      if (myExistingReview) {
        updateReview(myExistingReview.id, {
          criteriaScores: scores,
          score: weightedScore,
          comment,
          generalComment: comment,
          strengths,
          concerns,
          conclusion,
          status: 'completed',
        });
      } else if (id) {
        createReview({
          applicationId: id,
          reviewerId,
          reviewerName,
          criteriaScores: scores,
          score: weightedScore,
          comment,
          generalComment: comment,
          strengths,
          concerns,
          conclusion,
          status: 'completed',
        });
      }
      if (id) updateApplicationStatus(id, 'reviewed');
      showToast('评审提交成功！', 'success');
      setTimeout(() => navigate('/review-center'), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) {
    return (
      <PageContainer
        title="项目评审"
        actions={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/review-center')}>
            返回评审中心
          </Button>
        }
      >
        <EmptyState
          icon={<ClipboardCheck />}
          title="项目不存在"
          description="您查看的项目申请不存在或已被删除"
          iconVariant="slate"
          action={{ label: '返回评审中心', onClick: () => navigate('/review-center'), icon: <ArrowLeft /> }}
        />
      </PageContainer>
    );
  }

  const getLogoColor = (name: string) => {
    const colors = [
      'from-indigo-400 to-violet-500',
      'from-emerald-400 to-teal-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const conclusionOptions: { key: ReviewConclusion; label: string; icon: typeof CheckCircle2; variant: string }[] = [
    { key: 'advance', label: '推荐晋级', icon: CheckCircle, variant: 'emerald' },
    { key: 'pending', label: '待定观察', icon: HelpCircle, variant: 'amber' },
    { key: 'reject', label: '建议拒绝', icon: XCircle, variant: 'rose' },
  ];

  return (
    <PageContainer
      title="项目评审打分"
      subtitle="请根据项目资料对五个维度进行专业评分并给出评审意见"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/review-center')}>
            返回评审中心
          </Button>
          <Badge variant={getStatusBadgeVariant(application.status)} dot className="px-3 py-1.5 text-xs">
            {formatStatusChinese(application.status)}
          </Badge>
        </div>
      }
    >
      <AnimatePresence>{toast && <Toast message={toast.message} variant={toast.variant} />}</AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-br from-indigo-50/60 via-violet-50/40 to-transparent border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br shadow-lg flex-shrink-0',
                      getLogoColor(application.projectName),
                    )}
                  >
                    {application.projectName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                          {application.projectName}
                        </h3>
                        {application.oneLiner && (
                          <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {application.oneLiner}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="violet" className="text-xs px-2.5 py-1">
                          {application.industry}
                        </Badge>
                        <Badge variant="indigo" className="text-xs px-2.5 py-1">
                          {application.stage}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                      {application.headquarters && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {application.headquarters}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {application.teamSize} 人团队
                      </span>
                      {application.website && (
                        <a
                          href={application.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          官网
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-indigo-50/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">融资金额</p>
                  <p className="text-base font-bold text-indigo-700">
                    {formatCurrency(application.fundingRequested)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-violet-50/50">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">出让股权</p>
                  <p className="text-base font-bold text-violet-700">
                    {application.equityOffered ? `${application.equityOffered}%` : '-'}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">申请期别</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 leading-tight">
                    {application.batch?.replace('-', ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <CardTitle className="text-base">创始人团队</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {application.founders && application.founders.length > 0 ? (
                  application.founders.map((f, idx) => (
                    <div
                      key={f.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl',
                        idx === 0 ? 'bg-indigo-50/40 border border-indigo-100' : 'bg-slate-50/50 border border-slate-100',
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br shadow-sm flex-shrink-0',
                          idx === 0
                            ? 'from-indigo-400 to-violet-500'
                            : getLogoColor(f.name),
                        )}
                      >
                        {f.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                          {f.title && (
                            <Badge variant={idx === 0 ? 'indigo' : 'slate'} className="text-[10px] px-1.5 py-0.5">
                              {f.title}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500 flex-wrap">
                          {f.email && (
                            <span className="inline-flex items-center gap-0.5">
                              <Mail className="w-3 h-3" />
                              {f.email}
                            </span>
                          )}
                          {f.phone && (
                            <span className="inline-flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              {f.phone}
                            </span>
                          )}
                        </div>
                        {f.background && (
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.background}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br shadow-sm flex-shrink-0',
                        getLogoColor(application.founderName),
                      )}
                    >
                      {application.founderName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{application.founderName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{application.founderContact}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <CardTitle className="text-base">核心数据摘要</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                {application.problemStatement && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">问题描述</p>
                    <p className="text-slate-700 leading-relaxed line-clamp-3">{application.problemStatement}</p>
                  </div>
                )}
                {application.solution && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">解决方案</p>
                    <p className="text-slate-700 leading-relaxed line-clamp-3">{application.solution}</p>
                  </div>
                )}
                {application.competitiveAdvantage && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">竞争优势</p>
                    <p className="text-slate-700 leading-relaxed line-clamp-3">{application.competitiveAdvantage}</p>
                  </div>
                )}
                {application.userMetrics && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">用户/业务数据</p>
                    <p className="text-slate-700 leading-relaxed">{application.userMetrics}</p>
                  </div>
                )}
                {application.businessProgress && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">业务进展</p>
                    <p className="text-slate-700 leading-relaxed">{application.businessProgress}</p>
                  </div>
                )}
                {application.businessModel && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">商业模式</p>
                    <p className="text-slate-700 leading-relaxed line-clamp-2">{application.businessModel}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-gradient-border bg-gradient-to-br from-rose-50/30 via-white to-indigo-50/30">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <CardTitle className="text-base">融资需求</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">融资金额</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(application.fundingRequested)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[11px] text-slate-400 mb-1">出让股权</p>
                    <p className="text-xl font-bold text-slate-800">{application.equityOffered ? `${application.equityOffered}%` : '-'}</p>
                  </div>
                </div>
                {application.fundUsage && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">资金用途</p>
                    <p className="text-slate-700 leading-relaxed">{application.fundUsage}</p>
                  </div>
                )}
                {application.postFundingMilestones && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">融资后里程碑</p>
                    <p className="text-slate-700 leading-relaxed">{application.postFundingMilestones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/70 to-indigo-50/40 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-200/50">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">五维评分</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">完成度 {completionPercent}% · 加权计算</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.div
                      key={weightedScore}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className={cn(
                        'relative inline-flex items-end gap-1 px-5 py-2.5 rounded-2xl',
                        isPassing
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/60'
                          : weightedScore > 0
                          ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-200/40'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <span
                        className="font-bold leading-none"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '3rem',
                        }}
                      >
                        {weightedScore.toFixed(0)}
                      </span>
                      <span className={cn('font-semibold mb-2.5', isPassing ? 'text-emerald-100' : 'text-slate-300')}>
                        /100
                      </span>
                      {isPassing && (
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md"
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      )}
                    </motion.div>
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium',
                          isPassing
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : weightedScore > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-500 border border-slate-200',
                        )}
                      >
                        {isPassing ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            超过晋级线 {PASS_THRESHOLD} 分
                          </>
                        ) : weightedScore > 0 ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            晋级线 {PASS_THRESHOLD} 分，还差 {PASS_THRESHOLD - weightedScore} 分
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-3 h-3" />
                            晋级线 {PASS_THRESHOLD} 分
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-5 space-y-7">
                <Slider
                  label="团队"
                  weight="20%"
                  subLabels={['团队完整度', '背景匹配度', '执行能力']}
                  value={scores.team}
                  onChange={(v) => setScores((p) => ({ ...p, team: v }))}
                />
                <Slider
                  label="市场"
                  weight="25%"
                  subLabels={['市场规模', '增长潜力', '痛点强度']}
                  value={scores.market}
                  onChange={(v) => setScores((p) => ({ ...p, market: v }))}
                />
                <Slider
                  label="产品"
                  weight="25%"
                  subLabels={['创新性', '技术壁垒', '用户体验']}
                  value={scores.product}
                  onChange={(v) => setScores((p) => ({ ...p, product: v }))}
                />
                <Slider
                  label="商业模式"
                  weight="20%"
                  subLabels={['可行性', '单位经济', '扩展能力']}
                  value={scores.business}
                  onChange={(v) => setScores((p) => ({ ...p, business: v }))}
                />
                <Slider
                  label="融资合理度"
                  weight="10%"
                  subLabels={['估值合理', '资金使用清晰']}
                  value={scores.funding}
                  onChange={(v) => setScores((p) => ({ ...p, funding: v }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <CardTitle className="text-base">评审意见</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      项目优势
                    </label>
                    <span className="text-[11px] text-slate-400">已选 {strengths.length} 项</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {STRENGTH_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag('strength', tag)}
                        className={cn(
                          'inline-flex items-center h-7 px-3 rounded-full text-xs font-medium transition-all',
                          strengths.includes(tag)
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100',
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                    {strengths.filter((t) => !STRENGTH_OPTIONS.includes(t)).map((tag) => (
                      <span
                        key={`custom-${tag}`}
                        className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => setStrengths((prev) => prev.filter((t) => t !== tag))}
                          className="hover:bg-white/20 rounded-full p-0.5 -mr-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={customStrength}
                      onChange={(e) => setCustomStrength(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag('strength'))}
                      placeholder="添加自定义优势标签..."
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => addCustomTag('strength')}
                      className="h-9"
                    >
                      添加
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      顾虑与风险
                    </label>
                    <span className="text-[11px] text-slate-400">已选 {concerns.length} 项</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {CONCERN_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag('concern', tag)}
                        className={cn(
                          'inline-flex items-center h-7 px-3 rounded-full text-xs font-medium transition-all',
                          concerns.includes(tag)
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100',
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                    {concerns.filter((t) => !CONCERN_OPTIONS.includes(t)).map((tag) => (
                      <span
                        key={`custom-${tag}`}
                        className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-xs font-medium bg-amber-500 text-white shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => setConcerns((prev) => prev.filter((t) => t !== tag))}
                          className="hover:bg-white/20 rounded-full p-0.5 -mr-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={customConcern}
                      onChange={(e) => setCustomConcern(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag('concern'))}
                      placeholder="添加自定义顾虑标签..."
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => addCustomTag('concern')}
                      className="h-9"
                    >
                      添加
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2.5 block">综合评语</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="请撰写综合评审意见，包括项目亮点、风险点、建议等..."
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400',
                      'focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all',
                      'resize-none leading-relaxed',
                    )}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[11px] text-slate-400">{comment.length} 字</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <ClipboardCheck className="w-4.5 h-4.5" />
                  </div>
                  <CardTitle className="text-base">评审结论</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {conclusionOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = conclusion === opt.key;
                    const colorMap: Record<string, string> = {
                      emerald: active ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30',
                      amber: active ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/30',
                      rose: active ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/30',
                    };
                    const iconMap: Record<string, string> = {
                      emerald: active ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600',
                      amber: active ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600',
                      rose: active ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600',
                    };
                    const textMap: Record<string, string> = {
                      emerald: active ? 'text-emerald-800' : 'text-slate-700',
                      amber: active ? 'text-amber-800' : 'text-slate-700',
                      rose: active ? 'text-rose-800' : 'text-slate-700',
                    };
                    return (
                      <label
                        key={opt.key}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                          colorMap[opt.variant],
                        )}
                      >
                        <input
                          type="radio"
                          name="conclusion"
                          value={opt.key}
                          checked={active}
                          onChange={() => setConclusion(opt.key)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            'w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center shadow-sm transition-all',
                            iconMap[opt.variant],
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={cn('text-sm font-bold', textMap[opt.variant])}>{opt.label}</p>
                      </label>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveDraft}
                    loading={isSaving}
                    className="h-11"
                  >
                    保存草稿
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    className="h-11 shadow-md shadow-indigo-200/60"
                  >
                    提交评审
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

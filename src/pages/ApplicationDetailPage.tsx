import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Target,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Users,
  ArrowLeft,
  Clock,
  Building2,
  Globe,
  CalendarDays,
  ClipboardCheck,
  CalendarPlus,
  PartyPopper,
  Ban,
  ChevronRight,
  Mail,
  Phone,
  Edit3,
  Eye,
  Award,
  X,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
} from '@/components/common';
import { useApplicationStore } from '@/stores/applicationStore';
import { useReviewStore } from '@/stores/reviewStore';
import { formatStatusChinese, getStatusBadgeVariant, formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  delay?: number;
}

function Section({ title, icon: Icon, iconColor = 'indigo', children, delay = 0 }: SectionProps) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden h-full">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorMap[iconColor])}>
              <Icon className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </motion.section>
  );
}

function InfoRow({ label, value, span }: { label: string; value?: React.ReactNode; span?: number }) {
  return (
    <div className={cn(span === 2 && 'sm:col-span-2')}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-sm text-slate-700 leading-relaxed', (!value || value === '') && 'text-slate-400 italic')}>
        {value || '未填写'}
      </p>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getApplicationById = useApplicationStore((s) => s.getApplicationById);
  const updateApplicationStatus = useApplicationStore((s) => s.updateApplicationStatus);
  const scheduleDefense = useApplicationStore((s) => s.scheduleDefense);
  const application = id ? getApplicationById(id) : undefined;

  const getReviewsByApplication = useReviewStore((s) => s.getReviewsByApplication);
  const reviews = useMemo(() => (id ? getReviewsByApplication(id) : []), [id, getReviewsByApplication]);
  const completedReviews = reviews.filter((r) => r.status === 'completed');
  const avgScore =
    completedReviews.length > 0
      ? (completedReviews.reduce((sum, r) => sum + r.score, 0) / completedReviews.length).toFixed(1)
      : null;

  if (!application) {
    return (
      <PageContainer
        title="申请详情"
        actions={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/applications')}>
            返回列表
          </Button>
        }
      >
        <EmptyState
          icon={<FileText />}
          title="申请不存在"
          description="您查看的申请记录不存在或已被删除"
          iconVariant="slate"
          action={{ label: '返回列表', onClick: () => navigate('/applications'), icon: <ArrowLeft /> }}
        />
      </PageContainer>
    );
  }

  const canStartReview = ['submitted'].includes(application.status);
  const canScheduleDefense = ['reviewed', 'defense_scheduled', 'accepted'].includes(application.status);
  const canAccept = ['reviewed', 'defense_scheduled'].includes(application.status);
  const canReject = ['reviewing', 'reviewed'].includes(application.status);
  const canConfirmBatch = ['accepted'].includes(application.status);
  const canEdit = ['draft', 'submitted'].includes(application.status);

  const [defenseModalOpen, setDefenseModalOpen] = useState(false);
  const [defenseDate, setDefenseDate] = useState('');
  const [defenseTime, setDefenseTime] = useState('10:00');
  const [defenseLocation, setDefenseLocation] = useState('加速器路演厅A');
  const [defensePanel, setDefensePanel] = useState<string[]>(['u4']);
  const [defenseSuccess, setDefenseSuccess] = useState(false);

  const openDefenseModal = () => {
    if (application?.defense) {
      const dt = new Date(application.defense.scheduledAt);
      setDefenseDate(dt.toISOString().slice(0, 10));
      setDefenseTime(
        `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
      );
      setDefenseLocation(application.defense.location);
      setDefensePanel(application.defense.panelIds);
    } else {
      setDefenseDate('');
      setDefenseTime('10:00');
      setDefenseLocation('加速器路演厅A');
      setDefensePanel(['u4']);
    }
    setDefenseSuccess(false);
    setDefenseModalOpen(true);
  };

  const handleScheduleDefense = () => {
    if (!defenseDate || !application) return;
    const scheduledAt = new Date(`${defenseDate}T${defenseTime}:00`).toISOString();
    const panelNames = defensePanel
      .map((jid) => availableJudges.find((j) => j.id === jid)?.name)
      .filter(Boolean) as string[];

    scheduleDefense(application.id, {
      scheduledAt,
      location: defenseLocation,
      panelIds: defensePanel,
      panelNames,
    });

    setDefenseSuccess(true);
    setTimeout(() => {
      setDefenseModalOpen(false);
      setDefenseSuccess(false);
    }, 1200);
  };

  const availableJudges = [
    { id: 'u2', name: '李运营', role: '运营总监' },
    { id: 'u3', name: '张投资', role: '投资合伙人' },
    { id: 'u4', name: '王评审', role: '资深评审' },
  ];

  const toggleJudge = (judgeId: string) => {
    setDefensePanel((prev) =>
      prev.includes(judgeId) ? prev.filter((id) => id !== judgeId) : [...prev, judgeId]
    );
  };

  return (
    <PageContainer
      title={application.projectName}
      subtitle={application.oneLiner}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/applications')}>
            返回列表
          </Button>
          <Badge variant={getStatusBadgeVariant(application.status)} dot className="px-3 py-1.5 text-xs">
            {formatStatusChinese(application.status)}
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="基础信息" icon={FileText} iconColor="indigo" delay={0}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="项目名称" value={application.projectName} />
              <InfoRow label="所属行业" value={application.industry} />
              <InfoRow label="融资阶段" value={application.stage} />
              <InfoRow label="申请期别" value={application.batch} />
              <InfoRow label="总部地点" value={application.headquarters} />
              <InfoRow label="团队人数" value={application.teamSize ? `${application.teamSize} 人` : undefined} />
              <InfoRow label="官方网站" value={application.website} />
              <InfoRow label="标签" value={
                application.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {application.tags.map((t) => (
                      <Badge key={t} variant="violet" className="text-[11px] px-2 py-0.5">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : undefined
              } />
              <InfoRow
                label="申请时间"
                value={application.createdAt ? new Date(application.createdAt).toLocaleString('zh-CN') : undefined}
              />
              <InfoRow
                label="更新时间"
                value={application.updatedAt ? new Date(application.updatedAt).toLocaleString('zh-CN') : undefined}
              />
            </div>
          </Section>

          <Section title="项目介绍" icon={Target} iconColor="violet" delay={0.05}>
            <div className="space-y-5">
              <InfoRow label="一句话介绍" value={application.oneLiner} span={2} />
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">问题描述</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                  {application.problemStatement || '未填写'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">解决方案</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-indigo-50/30 rounded-lg p-4 border border-indigo-100/50">
                  {application.solution || '未填写'}
                </p>
              </div>
              <InfoRow label="目标市场" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.targetMarket}</p>
              } span={2} />
            </div>
          </Section>

          <Section title="商业模式" icon={TrendingUp} iconColor="emerald" delay={0.1}>
            <div className="space-y-5">
              <InfoRow label="商业模式" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.businessModel}</p>
              } span={2} />
              <InfoRow label="收入模式" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.revenueModel}</p>
              } span={2} />
              <InfoRow label="竞争优势" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.competitiveAdvantage}</p>
              } span={2} />
              <InfoRow label="竞品分析" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.competitorAnalysis}</p>
              } span={2} />
            </div>
          </Section>

          <Section title="当前进展" icon={CheckCircle2} iconColor="amber" delay={0.15}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <InfoRow
                  label="产品状态"
                  value={
                    application.productStatus && (
                      <Badge variant="amber" className="text-xs px-2.5 py-1">
                        {
                          {
                            concept: '概念阶段',
                            prototype: '原型开发',
                            mvp: 'MVP上线',
                            has_users: '已有用户',
                          }[application.productStatus]
                        }
                      </Badge>
                    )
                  }
                />
                {avgScore && (
                  <InfoRow
                    label="评审平均分"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-amber-700 text-base">{avgScore}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </span>
                    }
                  />
                )}
              </div>
              <InfoRow label="用户指标" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.userMetrics}</p>
              } span={2} />
              <InfoRow label="业务进展" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.businessProgress}</p>
              } span={2} />

              {application.milestones && application.milestones.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    项目里程碑
                  </p>
                  <div className="space-y-3">
                    {application.milestones.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border',
                          m.completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50/50 border-slate-200',
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            m.completed ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white',
                          )}
                        >
                          {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className={cn('text-sm font-semibold', m.completed ? 'text-emerald-800' : 'text-slate-800')}>
                              {m.title || '未命名里程碑'}
                            </p>
                            <p className="text-xs text-slate-500">{m.date}</p>
                          </div>
                          {m.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          <Section title="融资需求" icon={DollarSign} iconColor="rose" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow
                label="融资金额"
                value={
                  application.fundingRequested ? (
                    <span className="text-lg font-bold text-rose-600">
                      {formatCurrency(application.fundingRequested)}
                    </span>
                  ) : undefined
                }
              />
              <InfoRow
                label="出让股权"
                value={
                  application.equityOffered ? (
                    <span className="text-lg font-bold text-indigo-600">{application.equityOffered}%</span>
                  ) : undefined
                }
              />
              <InfoRow label="资金用途" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.fundUsage}</p>
              } span={2} />
              <InfoRow label="融资后里程碑" value={
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{application.postFundingMilestones}</p>
              } span={2} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">进度追踪</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {application.timeline && application.timeline.length > 0 ? (
                  <div className="relative pl-1">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-emerald-200" />
                    <div className="space-y-4">
                      {[...application.timeline].reverse().map((event, idx, arr) => (
                        <div key={event.id} className="relative flex gap-3">
                          <div className="relative z-10 flex-shrink-0">
                            <div
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white shadow-sm',
                                idx === 0
                                  ? 'border-indigo-500 ring-4 ring-indigo-100'
                                  : 'border-slate-300',
                              )}
                            >
                              {idx === 0 ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                              ) : (
                                <CheckCircle2
                                  className={cn(
                                    'w-3.5 h-3.5',
                                    ['accepted', 'in_batch', 'graduated'].includes(event.status)
                                      ? 'text-emerald-500'
                                      : event.status === 'rejected'
                                      ? 'text-rose-500'
                                      : 'text-slate-400',
                                  )}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p
                                  className={cn(
                                    'text-sm font-semibold leading-tight',
                                    idx === 0 ? 'text-indigo-700' : 'text-slate-800',
                                  )}
                                >
                                  {event.title}
                                </p>
                                {event.operator && (
                                  <p className="text-xs text-slate-500 mt-0.5">操作人：{event.operator}</p>
                                )}
                                {event.description && (
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                                )}
                              </div>
                              <Badge variant={getStatusBadgeVariant(event.status)} className="text-[10px] px-1.5 py-0.5 flex-shrink-0">
                                {formatStatusChinese(event.status)}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5">
                              {new Date(event.timestamp).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">暂无进度记录</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">创始人团队</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {application.founders && application.founders.length > 0 ? (
                  <div className="space-y-4">
                    {application.founders.map((f) => {
                      const colors = [
                        'from-indigo-400 to-violet-500',
                        'from-emerald-400 to-teal-500',
                        'from-amber-400 to-orange-500',
                        'from-rose-400 to-pink-500',
                      ];
                      const c = colors[f.name.charCodeAt(0) % colors.length];
                      return (
                        <div key={f.id} className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br shadow-sm flex-shrink-0',
                              c,
                            )}
                          >
                            {f.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-800">{f.name || '未填写'}</p>
                              {f.title && (
                                <Badge variant="indigo" className="text-[10px] px-1.5 py-0.5">
                                  {f.title}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                              {f.email && (
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {f.email}
                                </span>
                              )}
                              {f.phone && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {f.phone}
                                </span>
                              )}
                            </div>
                            {f.background && (
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50/60 rounded-lg p-2.5 border border-slate-100">
                                {f.background}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-slate-400 to-slate-500 flex-shrink-0">
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-slate-50/50 to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">运营操作</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {canEdit && (
                  <Button
                    fullWidth
                    variant="outline"
                    icon={<Edit3 className="w-4 h-4" />}
                    onClick={() => navigate(`/applications/${application.id}/edit`)}
                    className="h-11"
                  >
                    继续编辑
                  </Button>
                )}
                {canStartReview && (
                  <Button
                    fullWidth
                    variant="primary"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => {
                      updateApplicationStatus(application.id, 'reviewing');
                      navigate(`/reviews/${application.id}`);
                    }}
                    className="h-11 shadow-sm"
                  >
                    开始评审
                  </Button>
                )}
                {application.status === 'reviewing' && (
                  <Button
                    fullWidth
                    variant="primary"
                    icon={<ClipboardCheck className="w-4 h-4" />}
                    onClick={() => navigate(`/reviews/${application.id}`)}
                    className="h-11 shadow-sm"
                  >
                    继续评审
                  </Button>
                )}
                {application.defense && (
                  <div className="mb-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-900">答辩已安排</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 ml-9">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(application.defense.scheduledAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          {new Date(application.defense.scheduledAt).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{application.defense.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {(application.defense.panelNames || application.defense.panelIds)
                            .slice(0, 2)
                            .join('、')}
                          {application.defense.panelIds.length > 2 &&
                            ` 等${application.defense.panelIds.length}人`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {canScheduleDefense && (
                  <Button
                    fullWidth
                    variant={application.defense ? 'outline' : 'primary'}
                    icon={<CalendarPlus className="w-4 h-4" />}
                    onClick={openDefenseModal}
                    className="h-11"
                  >
                    {application.defense ? '修改答辩安排' : '安排答辩'}
                  </Button>
                )}
                {canAccept && (
                  <Button
                    fullWidth
                    icon={<PartyPopper className="w-4 h-4" />}
                    onClick={() => updateApplicationStatus(application.id, 'accepted')}
                    className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200/50"
                  >
                    初审通过
                  </Button>
                )}
                {canConfirmBatch && (
                  <Button
                    fullWidth
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => updateApplicationStatus(application.id, 'in_batch')}
                    className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200/50"
                  >
                    确认入营
                  </Button>
                )}
                {canReject && (
                  <Button
                    fullWidth
                    variant="danger"
                    icon={<Ban className="w-4 h-4" />}
                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                    className="h-11"
                  >
                    拒绝申请
                  </Button>
                )}
                {!canStartReview && !canScheduleDefense && !canAccept && !canReject && !canConfirmBatch && !canEdit && (
                  <div className="text-center py-3">
                    <p className="text-xs text-slate-500">当前状态暂无可用操作</p>
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-slate-100">
                  {completedReviews.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">已完成评审</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{completedReviews.length}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {defenseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !defenseSuccess || setDefenseModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {defenseSuccess ? (
                <div className="p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">答辩已安排</h3>
                  <p className="text-sm text-slate-500">
                    {defenseDate} {defenseTime} · {defenseLocation}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <CalendarPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">安排项目答辩</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{application.projectName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDefenseModalOpen(false)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                          <CalendarDays className="w-3.5 h-3.5 inline mr-1.5 -translate-y-0.5" />
                          答辩日期
                        </label>
                        <input
                          type="date"
                          value={defenseDate}
                          onChange={(e) => setDefenseDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                          <Clock className="w-3.5 h-3.5 inline mr-1.5 -translate-y-0.5" />
                          开始时间
                        </label>
                        <input
                          type="time"
                          value={defenseTime}
                          onChange={(e) => setDefenseTime(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                        <MapPin className="w-3.5 h-3.5 inline mr-1.5 -translate-y-0.5" />
                        答辩地点
                      </label>
                      <select
                        value={defenseLocation}
                        onChange={(e) => setDefenseLocation(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                      >
                        <option>加速器路演厅A</option>
                        <option>加速器路演厅B</option>
                        <option>多功能会议室</option>
                        <option>线上视频会议</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" />
                        答辩委员会
                        <span className="text-slate-400 font-normal">（已选 {defensePanel.length} 人）</span>
                      </label>
                      <div className="space-y-2">
                        {availableJudges.map((judge) => {
                          const selected = defensePanel.includes(judge.id);
                          return (
                            <label
                              key={judge.id}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                                selected
                                  ? 'border-indigo-500 bg-indigo-50/60'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleJudge(judge.id)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{judge.name}</p>
                                <p className="text-xs text-slate-500">{judge.role}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setDefenseModalOpen(false)}
                      className="h-11"
                    >
                      取消
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleScheduleDefense}
                      disabled={!defenseDate || defensePanel.length === 0}
                      className="h-11 shadow-sm shadow-indigo-200/50"
                    >
                      确认安排
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

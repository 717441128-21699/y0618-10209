import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const canScheduleDefense = ['reviewed', 'accepted'].includes(application.status);
  const canAccept = ['reviewed'].includes(application.status);
  const canReject = ['reviewing', 'reviewed'].includes(application.status);
  const canConfirmBatch = ['accepted'].includes(application.status);
  const canEdit = ['draft', 'submitted'].includes(application.status);

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
                      navigate(`/review/${application.id}`);
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
                    onClick={() => navigate(`/review/${application.id}`)}
                    className="h-11 shadow-sm"
                  >
                    继续评审
                  </Button>
                )}
                {canScheduleDefense && (
                  <Button
                    fullWidth
                    variant="outline"
                    icon={<CalendarPlus className="w-4 h-4" />}
                    onClick={() => {}}
                    className="h-11"
                  >
                    安排答辩
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
    </PageContainer>
  );
}

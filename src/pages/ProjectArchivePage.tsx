import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Calendar,
  UserCheck,
  Users,
  Banknote,
  MessageSquare,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  Heart,
  DollarSign,
  PieChart,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
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
} from '@/components/common';
import { cn } from '@/lib/utils';
import {
  mockApplications,
  mockReviews,
  mockMeetingNotes,
  mockMentorAssignments,
} from '@/mock/mockData';

type ArchiveTab = 'profile' | 'review' | 'mentoring' | 'health' | 'funding';

const TABS: { key: ArchiveTab; label: string; icon: typeof FileText }[] = [
  { key: 'profile', label: '完整档案', icon: FileText },
  { key: 'review', label: '评审记录', icon: Award },
  { key: 'mentoring', label: '辅导历史', icon: MessageSquare },
  { key: 'health', label: '健康度历史', icon: Heart },
  { key: 'funding', label: '融资结果', icon: Banknote },
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

const HEALTH_HISTORY = [
  { week: 'W1', 用户: 65, 营收: 40, 融资: 55, 综合: 55 },
  { week: 'W2', 用户: 68, 营收: 45, 融资: 58, 综合: 58 },
  { week: 'W3', 用户: 70, 营收: 50, 融资: 60, 综合: 61 },
  { week: 'W4', 用户: 73, 营收: 55, 融资: 62, 综合: 64 },
  { week: 'W5', 用户: 76, 营收: 60, 融资: 65, 综合: 68 },
  { week: 'W6', 用户: 78, 营收: 65, 融资: 68, 综合: 71 },
  { week: 'W7', 用户: 80, 营收: 70, 融资: 72, 综合: 74 },
  { week: 'W8', 用户: 83, 营收: 75, 融资: 75, 综合: 78 },
  { week: 'W9', 用户: 85, 营收: 78, 融资: 78, 综合: 80 },
  { week: 'W10', 用户: 87, 营收: 82, 融资: 82, 综合: 83 },
  { week: 'W11', 用户: 89, 营收: 86, 融资: 85, 综合: 86 },
  { week: 'W12', 用户: 92, 营收: 90, 融资: 88, 综合: 89 },
];

const BATCH_LABELS: Record<string, string> = {
  '2026-Spring': '2026春季加速营',
  '2026-Winter': '2025冬季加速营',
  '2025-Fall': '2025秋季加速营',
};

export default function ProjectArchivePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const projectIdx = mockApplications.findIndex((a) => a.id === id);
  const project = projectIdx >= 0 ? mockApplications[projectIdx] : mockApplications[0];
  const logoColor = LOGO_COLORS[projectIdx >= 0 ? projectIdx % 8 : 0];

  const [activeTab, setActiveTab] = useState<ArchiveTab>('profile');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const projectReviews = mockReviews.filter((r) => r.applicationId === project.id);
  const projectAssignments = mockMentorAssignments.filter(
    (a) => a.projectId === project.id,
  );
  const projectNotes = mockMeetingNotes.filter((n) => n.projectId === project.id);

  const statusBadge = (status: string) => {
    if (status === 'graduated')
      return { variant: 'emerald' as const, label: '已结业' };
    if (status === 'in_batch')
      return { variant: 'indigo' as const, label: '在营' };
    if (status === 'accepted' || status === 'reviewed')
      return { variant: 'violet' as const, label: '已入营' };
    if (status === 'rejected')
      return { variant: 'danger' as const, label: '未通过' };
    return { variant: 'slate' as const, label: '评审中' };
  };

  const statusInfo = statusBadge(project.status);

  const totalMentoring = projectAssignments.reduce(
    (sum, a) => sum + (a.status === 'active' || a.status === 'completed' ? 1 : 0),
    0,
  );
  const totalMeetings = projectNotes.length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const isFunded = ['Pre-A轮', 'A轮', 'B轮', 'C轮'].includes(project.stage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 24 },
    },
  };

  const renderProfile = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">申请资料概览</CardTitle>
            <CardDescription>项目入营提交的完整申请信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">创始人</p>
                <p className="font-semibold text-slate-900">{project.founderName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{project.founderContact}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">团队规模</p>
                <p className="font-semibold text-slate-900">{project.teamSize} 人</p>
                <p className="text-xs text-slate-500 mt-0.5">核心团队完整</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">所属行业</p>
                <p className="font-semibold text-slate-900">{project.industry}</p>
                <p className="text-xs text-slate-500 mt-0.5">赛道头部项目</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">融资阶段</p>
                <p className="font-semibold text-slate-900">{project.stage}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  计划融资 {project.fundingRequested / 10000}万
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">项目简介</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {project.projectDescription}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">核心标签</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-900">时间线</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>申请提交</span>
                    <span className="font-medium">
                      {project.submittedAt ? formatDate(project.submittedAt) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>资料创建</span>
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最后更新</span>
                    <span className="font-medium">{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-900">
                    导师匹配
                  </span>
                </div>
                {projectAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {projectAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-slate-700 shadow-sm">
                            {a.mentorName[0]}
                          </div>
                          <span className="text-xs font-medium text-slate-700">
                            {a.mentorName}
                          </span>
                        </div>
                        <Badge
                          variant={
                            a.status === 'active'
                              ? 'emerald'
                              : a.status === 'completed'
                                ? 'slate'
                                : 'warning'
                          }
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {a.status === 'active'
                            ? '辅导中'
                            : a.status === 'completed'
                              ? '已完成'
                              : '已暂停'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">暂无导师匹配</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderReview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">完整评审记录</CardTitle>
            <CardDescription>
              {projectReviews.length} 位评委的专业评审意见
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectReviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">暂无评审记录</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-200" />

                <div className="space-y-5">
                  {projectReviews.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * idx }}
                      className="relative pl-12"
                    >
                      <div
                        className={cn(
                          'absolute left-2.5 top-3 h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center',
                          r.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-amber-400',
                        )}
                      >
                        {r.status === 'completed' ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <Clock className="h-3 w-3 text-white" />
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-indigo-700" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {r.reviewerName}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {formatDate(r.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={cn(
                                'font-display text-2xl font-bold',
                                r.score >= 80
                                  ? 'text-emerald-600'
                                  : r.score >= 60
                                    ? 'text-amber-600'
                                    : r.score > 0
                                      ? 'text-rose-600'
                                      : 'text-slate-400',
                              )}
                            >
                              {r.score || '-'}
                            </div>
                            <p className="text-[10px] text-slate-400">综合得分</p>
                          </div>
                        </div>

                        {r.status === 'completed' && (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                              {[
                                { key: 'team', label: '团队' },
                                { key: 'market', label: '市场' },
                                { key: 'product', label: '产品' },
                                { key: 'traction', label: '运营' },
                              ].map((item) => (
                                <div
                                  key={item.key}
                                  className="p-2 rounded-lg bg-slate-50 text-center"
                                >
                                  <p className="text-[10px] text-slate-500 mb-0.5">
                                    {item.label}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {r.criteriaScores[
                                      item.key as keyof typeof r.criteriaScores
                                    ] || '-'}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {r.comment && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs font-medium text-slate-500 mb-1">
                                  评委评语
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {r.comment}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {r.status === 'pending' && (
                          <div className="py-2">
                            <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                              待评审
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderMentoring = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100">
          <p className="text-xs text-indigo-600 mb-1 font-medium">配对导师</p>
          <p className="font-display text-2xl font-bold text-indigo-700">
            {totalMentoring}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100">
          <p className="text-xs text-emerald-600 mb-1 font-medium">辅导会面</p>
          <p className="font-display text-2xl font-bold text-emerald-700">
            {totalMeetings}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100">
          <p className="text-xs text-amber-600 mb-1 font-medium">行动项</p>
          <p className="font-display text-2xl font-bold text-amber-700">
            {projectNotes.reduce((s, n) => s + n.actionItems.length, 0)}
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">辅导会面纪要</CardTitle>
            <CardDescription>
              记录每一次导师辅导的关键内容和待办事项
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectNotes.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无辅导记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectNotes.map((note) => {
                  const expanded = expandedNote === note.id;
                  return (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedNote(expanded ? null : note.id)
                        }
                        className="w-full p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="indigo" className="text-[10px] px-2 py-0.5">
                              {formatDate(note.meetingDate)}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {note.duration} 分钟
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-600 font-medium">
                              {projectAssignments.find(
                                (a) => a.id === note.assignmentId,
                              )?.mentorName || '导师'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                            {note.summary}
                          </p>
                          {note.actionItems.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span className="text-[11px] text-slate-500">
                                {note.actionItems.filter(
                                  (a) => a.status === 'completed',
                                ).length}
                                /{note.actionItems.length} 行动项完成
                              </span>
                            </div>
                          )}
                        </div>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/30">
                              <div className="pt-4 space-y-2">
                                <p className="text-sm font-medium text-slate-700 mb-2">
                                  行动项
                                </p>
                                {note.actionItems.map((item, i) => (
                                  <div
                                    key={item.id}
                                    className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-100"
                                  >
                                    <div
                                      className={cn(
                                        'mt-0.5 h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center',
                                        item.status === 'completed'
                                          ? 'bg-emerald-100'
                                          : item.status === 'in_progress'
                                            ? 'bg-amber-100'
                                            : 'bg-slate-100',
                                      )}
                                    >
                                      <CheckCircle2
                                        className={cn(
                                          'h-2.5 w-2.5',
                                          item.status === 'completed'
                                            ? 'text-emerald-600'
                                            : item.status === 'in_progress'
                                              ? 'text-amber-600'
                                              : 'text-slate-400',
                                        )}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-slate-800">
                                        {item.description}
                                      </p>
                                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                                        <span>负责人: {item.assignee}</span>
                                        <span>截止: {formatDate(item.dueDate)}</span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        item.status === 'completed'
                                          ? 'emerald'
                                          : item.status === 'in_progress'
                                            ? 'warning'
                                            : 'slate'
                                      }
                                      className="text-[9px] px-1.5 py-0.5"
                                    >
                                      {item.status === 'completed'
                                        ? '完成'
                                        : item.status === 'in_progress'
                                          ? '进行中'
                                          : '待办'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderHealth = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            label: '团队健康',
            value: HEALTH_HISTORY[11].用户,
            color: 'from-indigo-500 to-blue-500',
            icon: Users,
          },
          {
            label: '营收进展',
            value: HEALTH_HISTORY[11].营收,
            color: 'from-emerald-500 to-teal-500',
            icon: TrendingUp,
          },
          {
            label: '融资准备',
            value: HEALTH_HISTORY[11].融资,
            color: 'from-amber-500 to-orange-500',
            icon: DollarSign,
          },
          {
            label: '综合得分',
            value: HEALTH_HISTORY[11].综合,
            color: 'from-violet-500 to-purple-500',
            icon: Activity,
          },
        ].map((m) => (
          <div
            key={m.label}
            className="p-4 rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{m.label}</span>
              <div
                className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center bg-gradient-to-br',
                  m.color,
                )}
              >
                <m.icon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">
              {m.value}
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={cn('h-full rounded-full bg-gradient-to-r', m.color)}
              />
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">12周全周期健康度趋势</CardTitle>
                <CardDescription>
                  用户增长、营收、融资准备度三维叠加
                </CardDescription>
              </div>
              <Badge variant="emerald" className="text-xs px-2.5 py-1">
                W1-W12
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={HEALTH_HISTORY}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[30, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="综合"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Line
                    type="monotone"
                    dataKey="用户"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="营收"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="融资"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderFunding = () => {
    const isFunded = ['Pre-A轮', 'A轮', 'B轮', 'C轮'].includes(project.stage);

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {isFunded ? (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-white/20 text-white border-white/30 mb-3">
                        🎉 成功完成融资
                      </Badge>
                      <h3 className="text-2xl font-bold mb-1">
                        {project.projectName}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {project.stage} 轮融资成功交割
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70 mb-1">融资金额</p>
                      <p className="font-display text-4xl font-bold">
                        ¥{(project.fundingRequested / 10000).toFixed(0)}
                        <span className="text-xl ml-1 opacity-80">万</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                  <PieChart className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">融资进行中</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  本轮计划融资 {project.fundingRequested / 10000} 万元，当前阶段 {project.stage}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isFunded && (
          <>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <div className="p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">融资轮次</p>
                <p className="font-semibold text-slate-900 text-lg">
                  {project.stage}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">融资金额</p>
                <p className="font-semibold text-emerald-600 text-lg">
                  ¥{(project.fundingRequested / 10000).toFixed(0)}万
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">投后估值</p>
                <p className="font-semibold text-slate-900 text-lg">
                  ¥{(project.fundingRequested / 10000 * 5).toFixed(0)}万
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">完成时间</p>
                <p className="font-semibold text-slate-900 text-lg">2026年Q2</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">投资方名单</CardTitle>
                  <CardDescription>领投方与跟投方信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {[
                      {
                        name: '高瓴资本',
                        type: '领投',
                        amount: '¥500万',
                        percent: '20%',
                        variant: 'emerald' as const,
                      },
                      {
                        name: '红杉中国',
                        type: '跟投',
                        amount: '¥300万',
                        percent: '12%',
                        variant: 'indigo' as const,
                      },
                      {
                        name: '经纬创投',
                        type: '跟投',
                        amount: '¥200万',
                        percent: '8%',
                        variant: 'violet' as const,
                      },
                    ].map((inv) => (
                      <div
                        key={inv.name}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <span className="font-display font-bold text-slate-700">
                              {inv.name[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 text-sm">
                                {inv.name}
                              </p>
                              <Badge
                                variant={inv.variant}
                                className="text-[10px] px-1.5 py-0.5"
                              >
                                {inv.type}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              持股 {inv.percent}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-emerald-600 text-sm">
                          {inv.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <PageContainer
      title={project.projectName}
      subtitle={BATCH_LABELS[project.batch] || project.batch}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant={statusInfo.variant} className="text-xs px-3 py-1 h-7">
            {statusInfo.label}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1"
        >
          <Card className="bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border-slate-200">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center sm:text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <Building2 className="h-3 w-3" />
                    行业
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {project.industry}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <TrendingUp className="h-3 w-3" />
                    阶段
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {project.stage}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <Calendar className="h-3 w-3" />
                    入营日
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {project.submittedAt
                      ? formatDate(project.submittedAt)
                      : '-'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <CheckCircle2 className="h-3 w-3" />
                    结业日
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {project.status === 'graduated' ? '2026年6月15日' : '预计2026年6月'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <UserCheck className="h-3 w-3" />
                    匹配导师
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {totalMentoring} 位
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <MessageSquare className="h-3 w-3" />
                    辅导次数
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {totalMeetings} 次
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <Banknote className="h-3 w-3" />
                    融资额
                  </div>
                  <p className="font-semibold text-emerald-600 text-sm">
                    {isFunded
                      ? `¥${(project.fundingRequested / 10000).toFixed(0)}万`
                      : '进行中'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 sm:justify-start justify-center">
                    <Award className="h-3 w-3" />
                    轮次
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {project.stage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="relative">
          <div className="flex gap-1 p-1 rounded-2xl bg-slate-100/80 backdrop-blur-sm overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center',
                  activeTab === tab.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                )}
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
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
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'review' && renderReview()}
            {activeTab === 'mentoring' && renderMentoring()}
            {activeTab === 'health' && renderHealth()}
            {activeTab === 'funding' && renderFunding()}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

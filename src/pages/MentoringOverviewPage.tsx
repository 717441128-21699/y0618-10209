import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  TrendingUp,
  Download,
  UserPlus,
  Clock,
  MapPin,
  Video,
  Phone,
  AlertTriangle,
  FileText,
  Plus,
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
import { useMentoringStore } from '@/stores/mentoringStore';
import { useApplicationStore } from '@/stores/applicationStore';
import { useHealthStore } from '@/stores/healthStore';
import type { ActionItem, MeetingNote } from '@/types';
import { cn } from '@/lib/utils';

interface MentorGroup {
  mentorId: string;
  mentorName: string;
  focusAreas: string[];
  assignments: {
    id: string;
    projectId: string;
    projectName: string;
    industry: string;
    nextMeeting: string;
    actionItemCount: number;
    healthScore: number;
    status: string;
  }[];
}

interface ScheduleItem {
  id: string;
  time: string;
  projectName: string;
  mentorName: string;
  location: string;
  method: 'offline' | 'video' | 'phone';
}

interface DueActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  projectName: string;
  overdue: boolean;
}

const MENTOR_AVATARS: Record<string, string> = {
  u5: '赵',
  u6: '陈',
};

const MENTOR_COLORS: Record<string, string> = {
  u5: 'from-indigo-500 to-violet-600',
  u6: 'from-emerald-500 to-teal-600',
};

function generateMockSchedule(): ScheduleItem[] {
  return [
    {
      id: 's1',
      time: '06-18 10:00',
      projectName: '智云AI助手',
      mentorName: '赵导师',
      location: '加速器会议室A',
      method: 'offline',
    },
    {
      id: 's2',
      time: '06-18 14:30',
      projectName: '绿能新材',
      mentorName: '陈导师',
      location: '腾讯会议',
      method: 'video',
    },
    {
      id: 's3',
      time: '06-19 09:30',
      projectName: '零碳物流',
      mentorName: '赵导师',
      location: '电话沟通',
      method: 'phone',
    },
    {
      id: 's4',
      time: '06-19 15:00',
      projectName: '健行医疗',
      mentorName: '陈导师',
      location: '加速器路演厅',
      method: 'offline',
    },
    {
      id: 's5',
      time: '06-20 11:00',
      projectName: '消费级AR眼镜',
      mentorName: '赵导师',
      location: '飞书会议',
      method: 'video',
    },
  ];
}

function generateMockDueActions(allActionItems: (ActionItem & { projectName?: string })[]): DueActionItem[] {
  const now = Date.now();
  const withMeta = allActionItems
    .filter((a) => a.status !== 'completed')
    .map((a) => ({
      ...a,
      overdue: now > new Date(a.dueDate).getTime(),
      projectName: a.projectName || '智云AI助手',
    }))
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const defaults: DueActionItem[] = [
    {
      id: 'mock-ai-1',
      description: '完善Pitch Deck市场部分数据',
      assignee: '张明',
      dueDate: '2026-06-10T00:00:00Z',
      projectName: '智云AI助手',
      overdue: true,
    },
    {
      id: 'mock-ai-2',
      description: '联系3家KA客户进行需求访谈',
      assignee: '张明',
      dueDate: '2026-06-20T00:00:00Z',
      projectName: '智云AI助手',
      overdue: false,
    },
    {
      id: 'mock-ai-3',
      description: '准备Demo日路演PPT初稿',
      assignee: '李华',
      dueDate: '2026-06-22T00:00:00Z',
      projectName: '绿能新材',
      overdue: false,
    },
    {
      id: 'mock-ai-4',
      description: '完成竞品分析报告',
      assignee: '周健',
      dueDate: '2026-06-12T00:00:00Z',
      projectName: '健行医疗',
      overdue: true,
    },
    {
      id: 'mock-ai-5',
      description: '与供应链确认三季度产能',
      assignee: '冯光',
      dueDate: '2026-06-25T00:00:00Z',
      projectName: '消费级AR眼镜',
      overdue: false,
    },
  ];

  if (withMeta.length >= 5) return withMeta.slice(0, 5);
  return [...withMeta, ...defaults.slice(withMeta.length)].slice(0, 5);
}

export default function MentoringOverviewPage() {
  const navigate = useNavigate();
  const assignments = useMentoringStore((s) => s.assignments);
  const meetingNotes = useMentoringStore((s) => s.meetingNotes);
  const applications = useApplicationStore((s) => s.applications);
  const healthMetrics = useHealthStore((s) => s.metrics);
  const [hoverCardId, setHoverCardId] = useState<string | null>(null);

  const appMap = useMemo(() => {
    const map = new Map<string, { industry: string; status: string }>();
    for (const a of applications) {
      map.set(a.id, { industry: a.industry, status: a.status });
    }
    return map;
  }, [applications]);

  const healthMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of healthMetrics) {
      const existing = map.get(m.projectId);
      if (!existing || m.overallScore > existing) {
        map.set(m.projectId, m.overallScore);
      }
    }
    return map;
  }, [healthMetrics]);

  const actionCountByProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const mn of meetingNotes) {
      for (const ai of mn.actionItems) {
        if (ai.status !== 'completed') {
          map.set(mn.projectId, (map.get(mn.projectId) || 0) + 1);
        }
      }
    }
    return map;
  }, [meetingNotes]);

  const mentorGroups = useMemo<MentorGroup[]>(() => {
    const byMentor = new Map<string, MentorGroup>();
    for (const as of assignments) {
      if (!byMentor.has(as.mentorId)) {
        byMentor.set(as.mentorId, {
          mentorId: as.mentorId,
          mentorName: as.mentorName,
          focusAreas: [],
          assignments: [],
        });
      }
      const group = byMentor.get(as.mentorId)!;
      if (group.focusAreas.length === 0) {
        group.focusAreas = as.focusAreas;
      }
      const appInfo = appMap.get(as.projectId);
      const nextDates = [
        '2026-06-18 10:00',
        '2026-06-19 14:30',
        '2026-06-20 09:00',
        '2026-06-21 15:30',
        '2026-06-22 11:00',
      ];
      const idx = Math.abs(as.projectId.charCodeAt(3)) % nextDates.length;
      group.assignments.push({
        id: as.id,
        projectId: as.projectId,
        projectName: as.projectName,
        industry: appInfo?.industry || '企业服务',
        nextMeeting: nextDates[idx],
        actionItemCount: actionCountByProject.get(as.projectId) || Math.floor(Math.random() * 6) + 1,
        healthScore: healthMap.get(as.projectId) || Math.floor(Math.random() * 30) + 60,
        status: as.status,
      });
    }
    return Array.from(byMentor.values());
  }, [assignments, appMap, actionCountByProject, healthMap]);

  const scheduleItems = useMemo(() => generateMockSchedule(), []);

  const dueActions = useMemo(() => {
    const actions: (ActionItem & { projectName?: string })[] = [];
    for (const mn of meetingNotes) {
      for (const ai of mn.actionItems) {
        actions.push({
          ...ai,
          projectName: appMap.get(mn.projectId) ? undefined : ai.id.includes('app1') ? '智云AI助手' : undefined,
        });
      }
    }
    return generateMockDueActions(actions);
  }, [meetingNotes, appMap]);

  const stats = useMemo(() => {
    const matchedProjectCount = new Set(assignments.map((a) => a.projectId)).size;
    const totalMeetings = meetingNotes.length;
    let inProgressActions = 0;
    let totalActions = 0;
    for (const mn of meetingNotes) {
      for (const ai of mn.actionItems) {
        totalActions++;
        if (ai.status !== 'completed') inProgressActions++;
      }
    }
    const completionRate =
      totalActions > 0
        ? Math.round(((totalActions - inProgressActions) / totalActions) * 100)
        : 72;
    return {
      matched: Math.max(matchedProjectCount, 6),
      meetings: Math.max(totalMeetings, 24),
      inProgress: Math.max(inProgressActions, 18),
      completionRate: Math.max(completionRate, 72),
    };
  }, [assignments, meetingNotes]);

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

  const formatDueShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const healthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 65) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <PageContainer
      title="导师辅导中心"
      subtitle="系统化的创业辅导与成长陪伴"
      actions={
        <>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            导出辅导记录
          </Button>
          <Button className="gap-2 shadow-md shadow-indigo-200/50">
            <UserPlus className="h-4 w-4" />
            批量配对
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
            icon={Users}
            title="已配对项目数"
            value={stats.matched}
            subtitle="活跃导师 3 位"
            trend={{ value: '配对率 100%', positive: true }}
            gradient="indigo"
            className="cursor-default"
          />
          <StatCard
            icon={CalendarIcon}
            title="辅导总次数"
            value={stats.meetings}
            subtitle="本季新增 8 次"
            trend={{ value: '+3 环比', positive: true }}
            gradient="violet"
            className="cursor-default"
          />
          <StatCard
            icon={CheckSquare}
            title="在进行行动项"
            value={stats.inProgress}
            subtitle="覆盖 6 个项目"
            trend={{ value: '本周 +5', positive: true }}
            gradient="amber"
            className="cursor-default"
          />
          <StatCard
            icon={TrendingUp}
            title="平均完成率"
            value={`${stats.completionRate}%`}
            subtitle="较上月 +8pp"
            trend={{ value: `${stats.completionRate}%`, positive: true }}
            gradient="emerald"
            className="cursor-default"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
            {mentorGroups.map((group) => (
              <Card key={group.mentorId} className="overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br shadow-sm',
                          MENTOR_COLORS[group.mentorId] || 'from-slate-500 to-slate-600',
                        )}
                      >
                        {MENTOR_AVATARS[group.mentorId] || group.mentorName.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          {group.mentorName}
                        </CardTitle>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {group.focusAreas.map((area) => (
                            <Badge
                              key={area}
                              variant="slate"
                              className="text-[10.5px] px-2 py-0"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge variant="indigo" className="text-xs px-2.5 py-1 flex-shrink-0">
                      {group.assignments.length} 个项目
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {group.assignments.map((p) => {
                      const isHover = hoverCardId === p.id;
                      return (
                        <div
                          key={p.id}
                          className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                          onMouseEnter={() => setHoverCardId(p.id)}
                          onMouseLeave={() => setHoverCardId(null)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-800 truncate">
                                  {p.projectName}
                                </h4>
                                <Badge variant="violet" className="mt-1.5 text-[10.5px] px-2 py-0">
                                  {p.industry}
                                </Badge>
                              </div>
                              <span
                                className={cn(
                                  'text-xs font-bold rounded-lg px-2 py-1',
                                  healthColor(p.healthScore),
                                )}
                              >
                                {p.healthScore}分
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3 w-3 text-slate-400" />
                                <span>下次辅导：{p.nextMeeting}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckSquare className="h-3 w-3 text-slate-400" />
                                <span>行动项：{p.actionItemCount} 项待办</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              'mt-4 grid grid-cols-2 gap-2 transition-all duration-200 overflow-hidden',
                              isHover
                                ? 'max-h-20 opacity-100'
                                : 'max-h-0 opacity-0 pointer-events-none',
                            )}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() => navigate(`/meeting-notes/${p.id}`)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              查看纪要
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => navigate('/meeting-notes/new')}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              新建辅导
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={cardVariants} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">本周辅导日程</CardTitle>
                    <CardDescription>6月18日 - 6月24日</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {scheduleItems.map((s, idx) => {
                    const MethodIcon =
                      s.method === 'video'
                        ? Video
                        : s.method === 'phone'
                          ? Phone
                          : MapPin;
                    return (
                      <div
                        key={s.id}
                        className="relative pl-6 pb-4 last:pb-0"
                      >
                        {idx < scheduleItems.length - 1 && (
                          <div className="absolute left-[7px] top-3 bottom-0 w-px bg-slate-200" />
                        )}
                        <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-indigo-300 bg-white flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-1">
                          <Clock className="h-3 w-3" />
                          {s.time}
                        </div>
                        <div className="text-sm font-medium text-slate-800 mb-1">
                          {s.projectName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{s.mentorName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1">
                            <MethodIcon className="h-3 w-3 text-slate-400" />
                            {s.location}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">即将到期行动项</CardTitle>
                      <CardDescription>前 5 条重点任务</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2.5">
                  {dueActions.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        'rounded-xl border p-3 transition-colors',
                        a.overdue
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-slate-200 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p
                          className={cn(
                            'text-sm font-medium leading-snug line-clamp-2 flex-1',
                            a.overdue ? 'text-red-800' : 'text-slate-700',
                          )}
                        >
                          {a.description}
                        </p>
                        {a.overdue && (
                          <Badge variant="danger" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                            逾期
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate max-w-[120px]">{a.assignee}</span>
                        <span
                          className={cn(
                            'font-medium',
                            a.overdue ? 'text-red-600' : 'text-slate-600',
                          )}
                        >
                          截止 {formatDueShort(a.dueDate)}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-400">
                        {a.projectName}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  );
}

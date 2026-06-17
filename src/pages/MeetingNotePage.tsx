import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Tag,
  Plus,
  Trash2,
  FileText,
  Save,
  PenSquare,
  CheckCheck,
  ArrowLeft,
  AlertCircle,
  X,
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
import { useMentoringStore } from '@/stores/mentoringStore';
import { useApplicationStore } from '@/stores/applicationStore';
import { cn } from '@/lib/utils';
import type { ActionItem } from '@/types';

type MeetingForm = 'offline' | 'video' | 'phone';
type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

interface EditableActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: ActionStatus;
}

const MEETING_FORM_OPTIONS: { value: MeetingForm; label: string; icon: typeof MapPin }[] = [
  { value: 'offline', label: '线下面对面', icon: MapPin },
  { value: 'video', label: '视频会议', icon: Video },
  { value: 'phone', label: '电话沟通', icon: Phone },
];

const STATUS_OPTIONS: { value: ActionStatus; label: string; className: string }[] = [
  { value: 'pending', label: '待开始', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'in_progress', label: '进行中', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'completed', label: '已完成', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'overdue', label: '已逾期', className: 'bg-red-50 text-red-700 border-red-200' },
];

const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MeetingNotePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const meetingNotes = useMentoringStore((s) => s.meetingNotes);
  const assignments = useMentoringStore((s) => s.assignments);
  const applications = useApplicationStore((s) => s.applications);
  const createMeetingNote = useMentoringStore((s) => s.createMeetingNote);
  const updateMeetingNote = useMentoringStore((s) => s.updateMeetingNote);

  const isNew = id === 'new' || !id;
  const paramProjectId = searchParams.get('projectId');
  const paramMentorId = searchParams.get('mentorId');

  const existingNote = useMemo(() => {
    if (isNew) return null;
    return meetingNotes.find((m) => m.id === id);
  }, [id, isNew, meetingNotes]);

  const projectInfo = useMemo(() => {
    if (existingNote) {
      const app = applications.find((a) => a.id === existingNote.projectId);
      return {
        projectId: existingNote.projectId,
        projectName: app?.projectName || '智云AI助手',
        industry: app?.industry || '人工智能',
        mentorId: existingNote.mentorId,
        mentorName:
          assignments.find((a) => a.mentorId === existingNote.mentorId)?.mentorName ||
          '赵导师',
      };
    }
    if (paramProjectId) {
      const app = applications.find((a) => a.id === paramProjectId);
      const asn = assignments.find(
        (a) =>
          a.projectId === paramProjectId &&
          (paramMentorId ? a.mentorId === paramMentorId : a.status === 'active'),
      );
      return {
        projectId: paramProjectId,
        projectName: app?.projectName || asn?.projectName || '项目',
        industry: app?.industry || '未分类',
        mentorId: asn?.mentorId || paramMentorId || 'u5',
        mentorName: asn?.mentorName || '导师',
      };
    }
    const active = assignments.find((a) => a.status === 'active') || assignments[0];
    const app = active
      ? applications.find((a) => a.id === active.projectId)
      : applications[0];
    return {
      projectId: active?.projectId || 'app1',
      projectName: app?.projectName || '智云AI助手',
      industry: app?.industry || '人工智能',
      mentorId: active?.mentorId || 'u5',
      mentorName: active?.mentorName || '赵导师',
    };
  }, [existingNote, assignments, applications, paramProjectId, paramMentorId]);

  const activeAssignment = useMemo(() => {
    return assignments.find(
      (a) => a.projectId === projectInfo.projectId && a.mentorId === projectInfo.mentorId,
    ) || assignments.find((a) => a.projectId === projectInfo.projectId && a.status === 'active');
  }, [assignments, projectInfo.projectId, projectInfo.mentorId]);

  const returnToList = () => {
    navigate(`/mentoring/projects/${projectInfo.projectId}/meetings`);
  };

  const [meetingDate, setMeetingDate] = useState(
    existingNote ? existingNote.meetingDate.slice(0, 10) : todayStr(),
  );
  const [meetingTime, setMeetingTime] = useState(
    existingNote
      ? existingNote.meetingDate.slice(11, 16) || '10:00'
      : '10:00',
  );
  const [duration, setDuration] = useState(existingNote?.duration ?? 60);
  const [meetingForm, setMeetingForm] = useState<MeetingForm>('video');
  const [participants, setParticipants] = useState<string[]>([
    projectInfo.mentorName,
    '张明',
  ]);
  const [newParticipant, setNewParticipant] = useState('');

  const [topics, setTopics] = useState<string[]>(
    existingNote ? ['产品进展', '融资策略', '团队建设'] : ['产品战略', '团队建设'],
  );
  const [newTopic, setNewTopic] = useState('');

  const [decisions, setDecisions] = useState<string[]>(
    existingNote
      ? []
      : [
          'Q2核心目标聚焦KA客户拓展，暂不扩张SMB市场',
          '启动Pre-A轮融资准备，由导师介绍3家意向机构',
        ],
  );

  const [actions, setActions] = useState<EditableActionItem[]>(() => {
    if (existingNote && existingNote.actionItems.length > 0) {
      return existingNote.actionItems.map((a, idx) => ({
        id: a.id,
        description: a.description,
        assignee: a.assignee,
        dueDate: a.dueDate.slice(0, 10),
        status: (a.status === 'completed'
          ? 'completed'
          : idx === 0
            ? 'in_progress'
            : a.status) as ActionStatus,
      }));
    }
    return [
      {
        id: uid('ai_'),
        description: '完善Pitch Deck市场部分数据补充与图表美化',
        assignee: '张明',
        dueDate: addDaysStr(7),
        status: 'pending',
      },
      {
        id: uid('ai_'),
        description: '联系3家KA客户进行需求深度访谈并整理纪要',
        assignee: '张明',
        dueDate: addDaysStr(14),
        status: 'in_progress',
      },
    ];
  });

  const [summary, setSummary] = useState(
    existingNote?.summary ||
      '本次会议围绕Q2季度目标展开讨论，梳理了产品迭代优先级和下轮融资路径。团队对接下来3个月的关键里程碑达成共识，明确了各负责人的行动项和交付时间。',
  );

  const [saving, setSaving] = useState(false);

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

  const addTag = (list: string[], value: string, setter: (v: string[]) => void, inputSetter: (v: string) => void) => {
    const v = value.trim();
    if (!v) return;
    if (list.includes(v)) return;
    setter([...list, v]);
    inputSetter('');
  };

  const removeTag = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.filter((t) => t !== value));
  };

  const updateAction = (id: string, patch: Partial<EditableActionItem>) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const addAction = () => {
    setActions((prev) => [
      ...prev,
      {
        id: uid('ai_'),
        description: '',
        assignee: '',
        dueDate: addDaysStr(14),
        status: 'pending',
      },
    ]);
  };

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async (confirmType: 'draft' | 'mentor' | 'both') => {
    setSaving(true);
    const actionItems: ActionItem[] = actions
      .filter((a) => a.description.trim())
      .map((a) => ({
        id: a.id,
        description: a.description,
        assignee: a.assignee || '未指定',
        dueDate: `${a.dueDate}T00:00:00Z`,
        status:
          a.status === 'completed'
            ? 'completed'
            : a.status === 'overdue'
              ? 'in_progress'
              : a.status,
      }));

    const fullSummary = `${summary}\n\n讨论主题：${topics.join('、')}\n关键决策：${decisions.filter((d) => d.trim()).join('；')}`;

    if (isNew) {
      const assignmentId = activeAssignment?.id || `ma_${Date.now()}`;
      createMeetingNote({
        assignmentId,
        projectId: projectInfo.projectId,
        mentorId: projectInfo.mentorId,
        meetingDate: `${meetingDate}T${meetingTime}:00Z`,
        duration,
        summary: fullSummary,
        actionItems,
      });
    } else if (existingNote) {
      updateMeetingNote(existingNote.id, {
        meetingDate: `${meetingDate}T${meetingTime}:00Z`,
        duration,
        summary: fullSummary,
        actionItems,
      });
    }
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    returnToList();
  };

  return (
    <PageContainer
      title="辅导会面纪要"
      subtitle={isNew ? '新建辅导记录' : '编辑辅导会面内容'}
      actions={
        <>
          <Button variant="ghost" onClick={returnToList} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回辅导记录
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
        className="space-y-6 max-w-6xl mx-auto"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base">会议基本信息</CardTitle>
                  <CardDescription>辅导会面的基础配置</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                    日期
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    时间
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    时长（分钟）
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={15}
                    step={15}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600">辅导形式</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                    {MEETING_FORM_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMeetingForm(opt.value)}
                        className={cn(
                          'flex items-center justify-center gap-1 h-8 rounded-md text-xs font-medium transition-all',
                          meetingForm === opt.value
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800',
                        )}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">{opt.label.slice(0, 2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  参与人
                </label>
                <div className="rounded-lg border border-slate-300 bg-white p-2.5 min-h-[44px] flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  {participants.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => removeTag(participants, p, setParticipants)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(participants, newParticipant, setParticipants, setNewParticipant);
                      }
                    }}
                    placeholder="添加参与人后回车"
                    className="flex-1 min-w-[120px] h-7 px-1 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Tag className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base">讨论主题</CardTitle>
                  <CardDescription>本次会议覆盖的核心议题</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="rounded-lg border border-slate-300 bg-white p-3 min-h-[56px] flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium border border-violet-100"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(topics, t, setTopics)}
                      className="text-violet-500 hover:text-violet-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex-1 flex items-center gap-2 min-w-[180px]">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(topics, newTopic, setTopics, setNewTopic);
                      }
                    }}
                    placeholder="输入主题标签后回车"
                    className="flex-1 h-7 px-1 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => addTag(topics, newTopic, setTopics, setNewTopic)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">关键决策</CardTitle>
                    <CardDescription>会议达成的重要共识和决策</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8"
                  onClick={() => setDecisions([...decisions, ''])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  添加决策
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {decisions.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-2.5 h-5 w-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 relative group">
                      <textarea
                        value={d}
                        onChange={(e) => {
                          const next = [...decisions];
                          next[idx] = e.target.value;
                          setDecisions(next);
                        }}
                        rows={2}
                        placeholder="请输入本次会议达成的关键决策..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                      />
                      {decisions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDecisions(decisions.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="border-indigo-200">
            <CardHeader className="pb-3 bg-indigo-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <AlertCircle className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-indigo-900">下一步行动项</CardTitle>
                    <CardDescription>明确任务、负责人和截止日期</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 h-8"
                  onClick={addAction}
                >
                  <Plus className="h-3.5 w-3.5" />
                  新增行动项
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 font-medium">
                      <th className="py-3 px-4 w-[40%]">任务描述</th>
                      <th className="py-3 px-3 w-[14%]">负责人</th>
                      <th className="py-3 px-3 w-[18%]">截止日期</th>
                      <th className="py-3 px-3 w-[16%]">状态</th>
                      <th className="py-3 px-3 w-[12%] text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition"
                      >
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={a.description}
                            onChange={(e) => updateAction(a.id, { description: e.target.value })}
                            placeholder="请输入任务描述"
                            className="w-full rounded-md border border-transparent hover:border-slate-200 focus:border-indigo-500 bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={a.assignee}
                            onChange={(e) => updateAction(a.id, { assignee: e.target.value })}
                            placeholder="负责人"
                            className="w-full rounded-md border border-transparent hover:border-slate-200 focus:border-indigo-500 bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="date"
                            value={a.dueDate}
                            onChange={(e) => updateAction(a.id, { dueDate: e.target.value })}
                            className="w-full rounded-md border border-transparent hover:border-slate-200 focus:border-indigo-500 bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={a.status}
                            onChange={(e) => updateAction(a.id, { status: e.target.value as ActionStatus })}
                            className={cn(
                              'w-full rounded-md border px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition appearance-none cursor-pointer',
                              STATUS_OPTIONS.find((o) => o.value === a.status)?.className,
                            )}
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value} className="bg-white text-slate-800">
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeAction(a.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {actions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                          暂无行动项，点击上方按钮添加
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <PenSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">总结纪要</CardTitle>
                  <CardDescription>结构化整理本次会议的核心要点</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={7}
                placeholder="请输入本次辅导会面的总结纪要，包括进展回顾、问题诊断、方案建议等..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleSave('draft')}
              loading={saving}
            >
              <Save className="h-4 w-4" />
              保存草稿
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => handleSave('mentor')}
              loading={saving}
            >
              <PenSquare className="h-4 w-4" />
              导师确认签字
            </Button>
            <Button
              className="gap-2 shadow-md shadow-indigo-200/50"
              onClick={() => handleSave('both')}
              loading={saving}
            >
              <CheckCheck className="h-4 w-4" />
              双方确认提交
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Plus,
  Users,
  ChevronRight,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/common';
import { useMentoringStore } from '@/stores/mentoringStore';
import { useApplicationStore } from '@/stores/applicationStore';
import { cn } from '@/lib/utils';

export default function ProjectMeetingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const meetingNotes = useMentoringStore((s) => s.meetingNotes);
  const assignments = useMentoringStore((s) => s.assignments);
  const applications = useApplicationStore((s) => s.applications);

  const projectInfo = useMemo(() => {
    const app = applications.find((a) => a.id === projectId);
    if (app) {
      return {
        projectId: app.id,
        projectName: app.projectName,
        industry: app.industry,
        founderName: app.founderName,
      };
    }
    const asn = assignments.find((a) => a.projectId === projectId);
    return {
      projectId: projectId || 'app1',
      projectName: asn?.projectName || '未知项目',
      industry: '未分类',
      founderName: '创始人',
    };
  }, [projectId, applications, assignments]);

  const projectAssignment = useMemo(() => {
    return assignments.find((a) => a.projectId === projectId && a.status === 'active');
  }, [projectId, assignments]);

  const projectNotes = useMemo(() => {
    return meetingNotes
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
  }, [projectId, meetingNotes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
  };

  return (
    <PageContainer
      title="辅导会面记录"
      subtitle={projectInfo.projectName}
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate('/mentoring')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回辅导中心
          </Button>
          {projectAssignment && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() =>
                navigate(
                  `/mentoring/meetings/new?projectId=${projectAssignment.projectId}&mentorId=${projectAssignment.mentorId}`,
                )
              }
            >
              新建辅导
            </Button>
          )}
        </>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border-indigo-100">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200/60">
                    {projectInfo.projectName.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{projectInfo.projectName}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {projectInfo.founderName}
                      </span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span>{projectInfo.industry}</span>
                    </p>
                    {projectAssignment && (
                      <p className="text-xs text-slate-500 mt-1.5">
                        配对导师：
                        <span className="text-indigo-600 font-medium">
                          {projectAssignment.mentorName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 font-display">
                      {projectNotes.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">会面次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 font-display">
                      {projectNotes.reduce((sum, n) => sum + n.actionItems.length, 0)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">行动项</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {projectNotes.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">暂无会面记录</h3>
                <p className="text-sm text-slate-500 mb-5">
                  该项目还没有辅导会面记录，点击右上角开始第一次辅导
                </p>
                {projectAssignment && (
                  <Button
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() =>
                      navigate(
                        `/mentoring/meetings/new?projectId=${projectAssignment.projectId}&mentorId=${projectAssignment.mentorId}`,
                      )
                    }
                  >
                    新建第一次辅导
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                历史会面纪要
                <span className="text-xs font-normal text-slate-400">
                  共 {projectNotes.length} 条
                </span>
              </h3>
            </div>
            {projectNotes.map((note, idx) => {
              const dateStr = note.meetingDate.slice(0, 10);
              const dateObj = new Date(note.meetingDate);
              const monthDay = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
              const year = dateObj.getFullYear();
              const assignment = assignments.find((a) => a.id === note.assignmentId);
              const mentorName =
                assignment?.mentorName ||
                (note.mentorId
                  ? assignments.find((a) => a.mentorId === note.mentorId)?.mentorName
                  : '导师') || '导师';

              const completedActions = note.actionItems.filter(
                (a) => a.status === 'completed',
              ).length;
              const totalActions = note.actionItems.length;

              return (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link to={`/mentoring/meetings/${note.id}`}>
                    <Card className="group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 border-slate-100">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center w-16 flex-shrink-0 py-1 px-2 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                            <span className="text-base font-bold text-indigo-600">
                              {monthDay.slice(0, -1).replace('月', '/')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {year}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-800 truncate">
                                {note.summary.slice(0, 40) || '辅导会面'}
                                {note.summary.length > 40 && '...'}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {note.duration} 分钟
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {mentorName}
                              </span>
                              {totalActions > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {completedActions}/{totalActions} 行动项
                                </span>
                              )}
                            </div>
                            {note.actionItems.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {note.actionItems.slice(0, 2).map((ai) => (
                                  <Badge
                                    key={ai.id}
                                    variant={
                                      ai.status === 'completed' ? 'success' : 'warning'
                                    }
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    {ai.status === 'completed' ? '✓ ' : '○ '}
                                    {ai.description.slice(0, 14)}
                                    {ai.description.length > 14 && '...'}
                                  </Badge>
                                ))}
                                {note.actionItems.length > 2 && (
                                  <Badge
                                    variant="slate"
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    +{note.actionItems.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0 ml-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}

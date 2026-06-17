import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Presentation,
  ChevronUp,
  ChevronDown,
  Download,
  FileText,
  Activity,
  Heart,
  Eye,
  ArrowRight,
  Clock,
  Star,
  Search,
  CheckCircle2,
  Circle,
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
  StatCard,
} from '@/components/common';
import { PodiumRank, type PodiumRanking } from '@/components/features/demo-day';
import { useDemoDayStore } from '@/stores/demoDayStore';
import { cn } from '@/lib/utils';
import type { Application } from '@/types';
import { mockApplications } from '@/mock/mockData';

type DemoDayTab = 'schedule' | 'materials' | 'ranking' | 'scoring';

const TIMELINE_SLOTS = [
  { time: '10:00-10:15', projectIndex: 0 },
  { time: '10:20-10:35', projectIndex: 1 },
  { time: '10:40-10:55', projectIndex: 2 },
  { time: '11:00-11:15', projectIndex: 3 },
  { time: '11:20-11:35', projectIndex: 4 },
  { time: '14:00-14:15', projectIndex: 5 },
  { time: '14:20-14:35', projectIndex: 6 },
  { time: '14:40-14:55', projectIndex: 7 },
];

const DEMO_PROJECTS: (Application & { logoColor: string; founderAvatars: string[] })[] = [
  { ...mockApplications[0], logoColor: 'bg-indigo-500', founderAvatars: ['张明', '李华'] },
  { ...mockApplications[1], logoColor: 'bg-emerald-500', founderAvatars: ['王磊'] },
  { ...mockApplications[2], logoColor: 'bg-rose-500', founderAvatars: ['周健', '陈曦', '刘洋'] },
  { ...mockApplications[4], logoColor: 'bg-amber-500', founderAvatars: ['郑农'] },
  { ...mockApplications[6], logoColor: 'bg-cyan-500', founderAvatars: ['卫速', '林涛'] },
  { ...mockApplications[5], logoColor: 'bg-violet-500', founderAvatars: ['冯光'] },
  { ...mockApplications[3], logoColor: 'bg-blue-500', founderAvatars: ['吴迪', '赵思'] },
  { ...mockApplications[7], logoColor: 'bg-teal-500', founderAvatars: ['蒋教'] },
];

const TABS: { key: DemoDayTab; label: string; icon: typeof Calendar }[] = [
  { key: 'schedule', label: '路演安排', icon: Calendar },
  { key: 'materials', label: '项目资料', icon: FileText },
  { key: 'ranking', label: '实时排名', icon: Star },
  { key: 'scoring', label: '评分入口', icon: CheckCircle2 },
];

export default function DemoDayPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoDayTab>('schedule');
  const [countdown, setCountdown] = useState({ days: 0 });
  const [projectOrder, setProjectOrder] = useState<string[]>(
    DEMO_PROJECTS.map((p) => p.id),
  );
  const [rankingSeed, setRankingSeed] = useState(0);
  const [materialModal, setMaterialModal] = useState<{
    project: Application;
    type: 'bp' | 'health' | 'team';
  } | null>(null);

  const demoDay = useDemoDayStore((s) => s.getCurrentDemoDay());
  const getProjectRankings = useDemoDayStore((s) => s.getProjectRankings);
  const updateProjectOrder = useDemoDayStore((s) => s.updateProjectOrder);

  useEffect(() => {
    const target = new Date('2026-06-15T09:00:00Z').getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({ days: Math.ceil(diff / (1000 * 60 * 60 * 24)) });
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRankingSeed((s) => s + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const orderedProjects = useMemo(() => {
    const map = new Map(DEMO_PROJECTS.map((p) => [p.id, p]));
    return projectOrder.map((id) => map.get(id)!).filter(Boolean);
  }, [projectOrder]);

  const mockRankings = useMemo<PodiumRanking[]>(() => {
    const baseScores = [92.3, 89.1, 87.5, 85.2, 83.8, 81.5, 79.2, 76.8];
    return orderedProjects.slice(0, 8).map((p, i) => {
      const jitter = rankingSeed > 0 ? (Math.sin(rankingSeed * 3.7 + i) * 0.8) : 0;
      return {
        rank: i + 1,
        projectName: p.projectName,
        score: Math.max(60, Math.min(100, baseScores[i] + jitter)),
        investorCount: 28 - Math.floor(i * 2.5) + (i % 2),
        interest: i < 3,
      };
    });
  }, [orderedProjects, rankingSeed]);

  const handleMoveProject = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= projectOrder.length) return;
    const newOrder = [...projectOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setProjectOrder(newOrder);
    if (demoDay?.id) {
      const pid = projectOrder[index];
      updateProjectOrder(demoDay.id, pid, newIndex + 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  };

  const renderSchedule = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
          导出路演议程
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-14 sm:left-20 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-200" />

        <div className="space-y-6">
          {TIMELINE_SLOTS.map((slot, i) => {
            const project = orderedProjects[slot.projectIndex];
            if (!project) return null;

            return (
              <motion.div key={slot.time} variants={itemVariants} className="relative flex gap-4 sm:gap-6">
                <div className="w-12 sm:w-16 flex-shrink-0 pt-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white shadow-md absolute left-[44px] sm:left-[72px]">
                    <Clock className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 text-right">
                    {slot.time}
                  </p>
                </div>

                <div className="flex-1">
                  <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              'h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center shadow-sm',
                              (project as typeof DEMO_PROJECTS[0]).logoColor,
                            )}
                          >
                            <span className="font-display text-xl sm:text-2xl font-bold text-white">
                              {i + 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-slate-900 text-base">
                                {project.projectName}
                              </h4>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="indigo" className="text-[10px] px-1.5 py-0.5">
                                  {project.industry}
                                </Badge>
                                <span className="text-xs text-slate-500 line-clamp-1">
                                  {project.projectDescription}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleMoveProject(i, -1)}
                                disabled={i === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleMoveProject(i, 1)}
                                disabled={i === TIMELINE_SLOTS.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {(project as typeof DEMO_PROJECTS[0]).founderAvatars.map(
                                (name, idx) => (
                                  <div
                                    key={idx}
                                    className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-600"
                                    title={name}
                                  >
                                    {name[0]}
                                  </div>
                                ),
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              创始人团队
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderMaterials = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {orderedProjects.slice(0, 8).map((project, i) => (
        <motion.div
          key={project.id}
          variants={itemVariants}
          whileHover={{ y: -6, transition: { duration: 0.25 } }}
          className="group"
        >
          <Card className="h-full overflow-hidden border-slate-200 group-hover:border-indigo-300 group-hover:shadow-lg group-hover:shadow-indigo-100/50 transition-all duration-300">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
                    (project as typeof DEMO_PROJECTS[0]).logoColor,
                  )}
                >
                  <Presentation className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {project.projectName}
                  </h4>
                  <Badge variant="slate" className="mt-1 text-[10px] px-1.5 py-0.5">
                    {project.industry}
                  </Badge>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 line-clamp-2 flex-1">
                {project.projectDescription}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setMaterialModal({ project, type: 'bp' })}
                  className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px]">查看BP</span>
                </button>
                <button
                  onClick={() => setMaterialModal({ project, type: 'health' })}
                  className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-[10px]">健康度</span>
                </button>
                <button
                  onClick={() => setMaterialModal({ project, type: 'team' })}
                  className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-violet-600 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-[10px]">团队</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderRanking = () => {
    const top3 = mockRankings.slice(0, 3);
    const rest = mockRankings.slice(3);

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <Card className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
          <CardContent className="pt-8">
            <div className="text-center mb-2">
              <Badge variant="amber" dot className="text-xs px-3 py-1">
                实时更新中
              </Badge>
            </div>
            <PodiumRank rankings={top3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">排行榜 4-8 名</CardTitle>
              <span className="text-xs text-slate-500">
                已收集 {Math.round(15 + (rankingSeed % 10))} 份评分
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 w-14">
                      排名
                    </th>
                    <th className="py-3 px-2 text-left text-xs font-medium text-slate-500">
                      项目
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-medium text-slate-500">
                      总分
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-medium text-slate-500">
                      均分
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-medium text-slate-500">
                      已评分
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-medium text-slate-500 w-16">
                      感兴趣
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {rest.map((item) => (
                      <motion.tr
                        key={item.projectName}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 px-2">
                          <span className="font-display text-lg font-bold text-slate-700">
                            {item.rank}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 text-sm">
                              {item.projectName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <motion.span
                            key={`${item.projectName}-${rankingSeed}`}
                            initial={{ scale: 1.15, color: '#6366f1' }}
                            animate={{ scale: 1, color: '#0f172a' }}
                            transition={{ duration: 0.6 }}
                            className="font-display text-base font-semibold text-slate-900"
                          >
                            {(item.score * 28).toFixed(0)}
                          </motion.span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <motion.span
                            key={`${item.projectName}-avg-${rankingSeed}`}
                            initial={{ scale: 1.1, color: '#6366f1' }}
                            animate={{ scale: 1, color: '#475569' }}
                            transition={{ duration: 0.6 }}
                            className="font-display font-semibold text-slate-600"
                          >
                            {item.score.toFixed(1)}
                          </motion.span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                            {item.investorCount}/28
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Heart
                            className={cn(
                              'h-4 w-4 mx-auto',
                              item.interest
                                ? 'text-rose-500 fill-rose-500'
                                : 'text-slate-300',
                            )}
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderScoring = () => {
    const scoredSet = new Set([orderedProjects[0]?.id, orderedProjects[2]?.id]);

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {orderedProjects.slice(0, 8).map((project, i) => {
          const scored = scoredSet.has(project.id);
          const progress = scored ? Math.floor(18 + i * 1.2) : Math.floor(i * 1.5);

          return (
            <motion.div key={project.id} variants={itemVariants}>
              <Card
                className={cn(
                  'h-full cursor-pointer transition-all duration-200 hover:shadow-md',
                  scored
                    ? 'border-emerald-200 hover:border-emerald-400'
                    : 'border-slate-200 hover:border-indigo-400',
                )}
                onClick={() => navigate(`/demo-day/score/${project.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant={scored ? 'emerald' : 'slate'}
                      dot={scored}
                      className="text-[10px] px-2 py-0.5"
                    >
                      {scored ? '已评分' : '未评分'}
                    </Badge>
                    {scored ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        (project as typeof DEMO_PROJECTS[0]).logoColor,
                      )}
                    >
                      <span className="font-display text-sm font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      {project.projectName}
                    </h4>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">评分进度</span>
                      <span className="font-medium text-slate-700">
                        {progress}/28
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / 28) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                        className={cn(
                          'h-full rounded-full',
                          scored
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gradient-to-r from-indigo-400 to-indigo-500',
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">点击进入评分</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <PageContainer
      title="2026春季演示日"
      subtitle="Demo Day · 项目路演与投资人对接"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="amber" dot className="text-xs px-3 py-1 h-7">
            即将开始
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex flex-col items-end">
              <span className="font-display text-2xl font-bold text-amber-600 leading-none">
                {countdown.days}
              </span>
              <span className="text-[10px] text-amber-700 mt-0.5">天后</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                icon={Calendar}
                title="活动日期"
                value="2026年6月15日"
                subtitle="周一 · 全天"
                gradient="indigo"
                className="bg-white/60 backdrop-blur-sm"
              />
              <StatCard
                icon={MapPin}
                title="活动地点"
                value="上海张江科学会堂"
                subtitle="浦东新区"
                gradient="violet"
                className="bg-white/60 backdrop-blur-sm"
              />
              <StatCard
                icon={Users}
                title="参与投资人"
                value={28}
                subtitle="覆盖头部VC 20家"
                gradient="emerald"
                className="bg-white/60 backdrop-blur-sm"
              />
              <StatCard
                icon={Presentation}
                title="路演项目"
                value={8}
                subtitle="7大赛道领域"
                gradient="amber"
                className="bg-white/60 backdrop-blur-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="flex gap-1 p-1 rounded-2xl bg-slate-100/80 backdrop-blur-sm overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center',
                  activeTab === tab.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                )}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
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
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'ranking' && renderRanking()}
            {activeTab === 'scoring' && renderScoring()}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {materialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMaterialModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center',
                      (materialModal.project as typeof DEMO_PROJECTS[0]).logoColor,
                    )}
                  >
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {materialModal.project.projectName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {materialModal.type === 'bp'
                        ? '商业计划书 (BP)'
                        : materialModal.type === 'health'
                          ? '健康度报告'
                          : '团队详情'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMaterialModal(null)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">
                      {materialModal.type === 'bp' && '执行摘要'}
                      {materialModal.type === 'health' && '综合健康评分'}
                      {materialModal.type === 'team' && '核心团队成员'}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {materialModal.type === 'bp' &&
                        materialModal.project.projectDescription +
                          ' 项目成立于2025年初，目前已完成核心产品MVP开发，签约首批KA客户5家，ARR超过300万元。'}
                      {materialModal.type === 'health' &&
                        '团队健康度 88分 · 产品进度 86分 · 市场适配 82分 · 财务健康 84分 · 综合得分 85分。整体表现优秀，建议关注现金流管理和销售团队扩张。'}
                      {materialModal.type === 'team' &&
                        (materialModal.project as typeof DEMO_PROJECTS[0])
                          .founderAvatars.map((n) => `· ${n}：核心创始人，拥有10年以上行业经验`)
                          .join('\n')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

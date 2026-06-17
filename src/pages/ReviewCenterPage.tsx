import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Clock,
  ChevronRight,
  Building2,
  FileText,
  Search,
  ChevronDown,
  Filter,
  Eye,
  Users,
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
import { useReviewStore } from '@/stores/reviewStore';
import { useApplicationStore } from '@/stores/applicationStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type TabKey = 'pending' | 'completed' | 'all';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: '待评审' },
  { key: 'completed', label: '已评审' },
  { key: 'all', label: '全部' },
];

const INDUSTRY_OPTIONS = [
  '全行业',
  '人工智能',
  '新能源',
  '医疗健康',
  '企业服务',
  '农业科技',
  '硬件',
  '物流',
  '教育科技',
];

const BATCH_OPTIONS = [
  { value: 'all', label: '全部期别' },
  { value: '2026-Spring', label: '2026春季加速营' },
  { value: '2026-Winter', label: '2026冬季加速营' },
];

export default function ReviewCenterPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const reviewerId = currentUser?.id ?? 'u4';

  const { applications } = useApplicationStore();
  const reviews = useReviewStore((s) => s.reviews);

  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('全行业');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [assignedOnly, setAssignedOnly] = useState(true);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  const assignedReviewMap = useMemo(() => {
    const map = new Map<string, typeof reviews>();
    for (const r of reviews) {
      if (assignedOnly && r.reviewerId !== reviewerId) continue;
      const existing = map.get(r.applicationId) ?? [];
      map.set(r.applicationId, [...existing, r]);
    }
    return map;
  }, [reviews, reviewerId, assignedOnly]);

  const qualifiedApplications = useMemo(() => {
    return applications.filter((app) => {
      if (['draft', 'rejected', 'graduated'].includes(app.status)) return false;
      if (assignedOnly) {
        const myReviews = assignedReviewMap.get(app.id);
        if (!myReviews || myReviews.length === 0) {
          if (app.status !== 'submitted' && app.status !== 'reviewing') return false;
        }
      }
      if (selectedIndustry !== '全行业' && app.industry !== selectedIndustry) return false;
      if (selectedBatch !== 'all' && app.batch !== selectedBatch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          app.projectName.toLowerCase().includes(q) ||
          app.founderName.toLowerCase().includes(q) ||
          (app.oneLiner && app.oneLiner.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [applications, assignedReviewMap, assignedOnly, selectedIndustry, selectedBatch, searchQuery]);

  const displayedItems = useMemo(() => {
    const items = qualifiedApplications.map((app) => {
      const myReviews = assignedReviewMap.get(app.id) ?? [];
      const myCompleted = myReviews.filter((r) => r.status === 'completed');
      const myPending = myReviews.filter((r) => r.status === 'pending');

      let matchTab = true;
      if (activeTab === 'pending') {
        matchTab = myPending.length > 0 || app.status === 'submitted' || app.status === 'reviewing';
      } else if (activeTab === 'completed') {
        matchTab = myCompleted.length > 0;
      }
      return { app, myReviews, myCompleted, myPending, matchTab };
    });
    return items.filter((i) => i.matchTab).sort((a, b) => {
      const aTime = new Date(a.app.submittedAt ?? a.app.createdAt).getTime();
      const bTime = new Date(b.app.submittedAt ?? b.app.createdAt).getTime();
      return bTime - aTime;
    });
  }, [qualifiedApplications, assignedReviewMap, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { pending: 0, completed: 0, all: 0 };
    for (const { myCompleted, myPending, app } of qualifiedApplications.map((app) => {
      const myReviews = assignedReviewMap.get(app.id) ?? [];
      return {
        app,
        myCompleted: myReviews.filter((r) => r.status === 'completed'),
        myPending: myReviews.filter((r) => r.status === 'pending'),
      };
    })) {
      counts.all++;
      if (myPending.length > 0 || app.status === 'submitted' || app.status === 'reviewing') counts.pending++;
      if (myCompleted.length > 0) counts.completed++;
    }
    return counts;
  }, [qualifiedApplications, assignedReviewMap]);

  const calcWaitTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} 天 ${hours} 小时`;
    if (hours > 0) return `${hours} 小时`;
    return '刚刚';
  };

  const getLogoColor = (name: string) => {
    const colors = [
      'from-indigo-400 to-violet-500',
      'from-emerald-400 to-teal-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500',
      'from-sky-400 to-cyan-500',
      'from-violet-400 to-purple-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <PageContainer
      title="评审中心"
      subtitle="对入营申请项目进行专业评审和打分"
      actions={
        <Badge variant="indigo" className="text-xs px-3 py-1.5">
          {assignedOnly ? '只看分配给我的' : '查看全部项目'}
        </Badge>
      }
    >
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-medium transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[22px] h-5.5 rounded-full px-2 text-[11px] font-semibold',
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索项目名称、创始人..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={assignedOnly}
                  onChange={(e) => setAssignedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">分配给我的</span>
              </label>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIndustryOpen(!industryOpen);
                    setBatchOpen(false);
                  }}
                  className="h-10 gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{selectedIndustry}</span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-slate-500 transition-transform', industryOpen && 'rotate-180')}
                  />
                </Button>
                {industryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                  >
                    <div className="p-1.5">
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedIndustry(opt);
                            setIndustryOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                            selectedIndustry === opt
                              ? 'bg-indigo-50 font-semibold text-indigo-700'
                              : 'text-slate-700 hover:bg-slate-50',
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBatchOpen(!batchOpen);
                    setIndustryOpen(false);
                  }}
                  className="h-10 gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {BATCH_OPTIONS.find((b) => b.value === selectedBatch)?.label ?? '全部期别'}
                  </span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-slate-500 transition-transform', batchOpen && 'rotate-180')}
                  />
                </Button>
                {batchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                  >
                    <div className="p-1.5">
                      {BATCH_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSelectedBatch(opt.value);
                            setBatchOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                            selectedBatch === opt.value
                              ? 'bg-indigo-50 font-semibold text-indigo-700'
                              : 'text-slate-700 hover:bg-slate-50',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {displayedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EmptyState
              icon={<ClipboardCheck />}
              title={activeTab === 'pending' ? '暂无待评审项目' : activeTab === 'completed' ? '暂无已评审项目' : '暂无项目'}
              description={
                activeTab === 'pending'
                  ? '目前没有需要您评审的项目，或尝试切换筛选条件'
                  : activeTab === 'completed'
                  ? '您还没有完成任何项目评审'
                  : '还没有匹配的项目申请'
              }
              iconVariant="indigo"
              action={{
                label: '查看项目列表',
                icon: <Eye />,
                onClick: () => navigate('/applications'),
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {displayedItems.map(({ app, myPending, myCompleted }, idx) => {
              const submittedAt = app.submittedAt ?? app.createdAt;
              const waitText = calcWaitTime(submittedAt);
              const isUrgent = Date.now() - new Date(submittedAt).getTime() > 5 * 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-slate-200 group-hover:border-indigo-200 group-hover:shadow-xl group-hover:shadow-indigo-100/50 transition-all duration-300">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base bg-gradient-to-br shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300',
                            getLogoColor(app.projectName),
                          )}
                        >
                          {app.projectName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors truncate">
                              {app.projectName}
                            </h3>
                            {myCompleted.length > 0 && (
                              <Badge variant="emerald" className="text-[10px] px-2 py-0.5 flex-shrink-0 dot">
                                {myCompleted[0].score} 分
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="violet" className="text-[10px] px-2 py-0.5">
                              {app.industry}
                            </Badge>
                            <span className="text-[11px] text-slate-500">{app.stage}</span>
                          </div>
                        </div>
                      </div>

                      {app.oneLiner && (
                        <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2 min-h-[2rem]">
                          {app.oneLiner}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 pt-3 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>提交于 {new Date(submittedAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                        {myPending.length > 0 || (app.status === 'submitted' || app.status === 'reviewing') ? (
                          <Badge
                            variant={isUrgent ? 'amber' : 'info'}
                            className="text-[10px] px-2 py-0.5"
                            dot={isUrgent}
                          >
                            等待 {waitText}
                          </Badge>
                        ) : (
                          <Badge variant="emerald" className="text-[10px] px-2 py-0.5">
                            已完成
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          详情
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        <Button
                          size="sm"
                          variant={myCompleted.length > 0 ? 'outline' : 'primary'}
                          icon={<ClipboardCheck className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/review/${app.id}`)}
                          className={cn(
                            'h-9',
                            myCompleted.length === 0 && 'shadow-sm shadow-indigo-200/50',
                          )}
                        >
                          {myPending.length > 0
                            ? '开始评审'
                            : myCompleted.length > 0
                            ? '查看评审'
                            : app.status === 'submitted' || app.status === 'reviewing'
                            ? '开始评审'
                            : '查看评审'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}

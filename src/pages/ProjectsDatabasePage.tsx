import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Archive,
  Check,
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
import { cn } from '@/lib/utils';
import { mockApplications, mockMentorAssignments } from '@/mock/mockData';
import type { Application } from '@/types';

const BATCH_OPTIONS = [
  { value: '2026-Spring', label: '2026春季' },
  { value: '2026-Winter', label: '2025冬季' },
  { value: '2025-Fall', label: '2025秋季' },
];

const INDUSTRY_OPTIONS = [
  { value: '人工智能', label: '人工智能' },
  { value: '新能源', label: '新能源' },
  { value: '医疗健康', label: '医疗健康' },
  { value: '企业服务', label: '企业服务' },
  { value: '农业科技', label: '农业科技' },
  { value: '硬件', label: '硬件/消费电子' },
  { value: '物流', label: '物流' },
  { value: '教育科技', label: '教育科技' },
];

const FUNDING_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'unfunded', label: '未获投' },
  { value: '天使轮', label: '天使轮' },
  { value: '种子轮', label: '种子轮' },
  { value: 'Pre-A轮', label: 'Pre-A轮' },
  { value: 'A轮', label: 'A轮' },
  { value: 'B轮+', label: 'B轮及以上' },
];

const STAGE_OPTIONS = [
  { value: 'all', label: '全部阶段' },
  { value: 'idea', label: '创意期' },
  { value: 'mvp', label: 'MVP期' },
  { value: 'growth', label: '成长期' },
  { value: 'scale', label: '规模化' },
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
  'bg-orange-500',
  'bg-pink-500',
];

const ADDITIONAL_PROJECTS: Application[] = [
  {
    id: 'app9',
    projectName: '智能质检AI',
    projectDescription: '基于计算机视觉的工业产品缺陷检测系统，降低人工质检成本60%',
    founderName: '孙明',
    founderContact: '13800138009',
    teamSize: 7,
    industry: '人工智能',
    stage: '天使轮',
    batch: '2025-Fall',
    status: 'graduated',
    submittedAt: '2025-08-15T10:00:00Z',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
    userId: 'u2',
    fundingRequested: 2000000,
    tags: ['AI', '工业视觉', '智能制造'],
  },
  {
    id: 'app10',
    projectName: '储能BMS系统',
    projectDescription: '下一代分布式储能电池管理系统，提升安全性和循环寿命',
    founderName: '钱能',
    founderContact: '13800138010',
    teamSize: 16,
    industry: '新能源',
    stage: 'A轮',
    batch: '2025-Fall',
    status: 'graduated',
    submittedAt: '2025-08-20T10:00:00Z',
    createdAt: '2025-08-05T08:00:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
    userId: 'u3',
    fundingRequested: 12000000,
    tags: ['新能源', '储能', '硬科技'],
  },
  {
    id: 'app11',
    projectName: '数字疗法平台',
    projectDescription: '针对慢性疾病的软件即医疗器械平台，获NMPA二类证',
    founderName: '冯医',
    founderContact: '13800138011',
    teamSize: 22,
    industry: '医疗健康',
    stage: 'Pre-A轮',
    batch: '2025-Fall',
    status: 'graduated',
    submittedAt: '2025-08-10T10:00:00Z',
    createdAt: '2025-07-25T08:00:00Z',
    updatedAt: '2026-01-15T14:00:00Z',
    userId: 'u2',
    fundingRequested: 6000000,
    tags: ['数字疗法', '医疗器械', '慢病管理'],
  },
  {
    id: 'app12',
    projectName: '出海SaaS工具',
    projectDescription: '面向中国品牌出海的一站式营销自动化SaaS平台',
    founderName: '韩海',
    founderContact: '13800138012',
    teamSize: 11,
    industry: '企业服务',
    stage: 'A轮',
    batch: '2025-Fall',
    status: 'graduated',
    submittedAt: '2025-08-05T10:00:00Z',
    createdAt: '2025-07-20T08:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
    userId: 'u3',
    fundingRequested: 8000000,
    tags: ['SaaS', '出海', '营销自动化'],
  },
  {
    id: 'app13',
    projectName: '柔性传感器',
    projectDescription: '可穿戴柔性压力传感器，应用于医疗和运动健康领域',
    founderName: '杨感',
    founderContact: '13800138013',
    teamSize: 9,
    industry: '硬件',
    stage: 'Pre-A轮',
    batch: '2025-Fall',
    status: 'in_batch',
    submittedAt: '2025-08-25T10:00:00Z',
    createdAt: '2025-08-10T08:00:00Z',
    updatedAt: '2026-03-01T14:00:00Z',
    userId: 'u2',
    fundingRequested: 4000000,
    tags: ['传感器', '可穿戴', '硬科技'],
  },
  {
    id: 'app14',
    projectName: '冷链监控平台',
    projectDescription: '生物医药冷链全程温湿度监控与追溯SaaS平台',
    founderName: '朱链',
    founderContact: '13800138014',
    teamSize: 13,
    industry: '物流',
    stage: '天使轮',
    batch: '2026-Winter',
    status: 'graduated',
    submittedAt: '2025-09-30T10:00:00Z',
    createdAt: '2025-09-10T08:00:00Z',
    updatedAt: '2026-03-05T14:00:00Z',
    userId: 'u3',
    fundingRequested: 3000000,
    tags: ['冷链', 'SaaS', '生物医药'],
  },
  {
    id: 'app15',
    projectName: '合成生物学',
    projectDescription: '合成生物学研发平台，改造微生物生产高附加值天然产物',
    founderName: '秦合',
    founderContact: '13800138015',
    teamSize: 19,
    industry: '医疗健康',
    stage: 'Pre-A轮',
    batch: '2026-Winter',
    status: 'graduated',
    submittedAt: '2025-09-20T10:00:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2026-02-28T14:00:00Z',
    userId: 'u2',
    fundingRequested: 15000000,
    tags: ['合成生物', '生物制造', '硬科技'],
  },
];

const ALL_PROJECTS = [...mockApplications, ...ADDITIONAL_PROJECTS];

const PROJECT_EXTRA: Record<
  string,
  {
    users: string;
    mrr: string;
    fundingAmount: string | null;
    year: number;
    mentorName: string;
  }
> = {
  app1: { users: '8.2万', mrr: '¥48万', fundingAmount: '¥800万', year: 2026, mentorName: '赵导师' },
  app2: { users: '3个', mrr: '¥25万', fundingAmount: '¥2000万', year: 2026, mentorName: '陈导师' },
  app3: { users: '1.2万', mrr: '¥8万', fundingAmount: null, year: 2026, mentorName: '李导师' },
  app4: { users: '50+', mrr: '¥120万', fundingAmount: '¥5000万', year: 2025, mentorName: '陈导师' },
  app5: { users: '5千', mrr: '¥3万', fundingAmount: null, year: 2026, mentorName: '王导师' },
  app6: { users: '1.5万', mrr: '¥80万', fundingAmount: '¥3000万', year: 2025, mentorName: '赵导师' },
  app7: { users: '3城', mrr: '¥18万', fundingAmount: null, year: 2026, mentorName: '赵导师' },
  app8: { users: '2万', mrr: '¥5万', fundingAmount: null, year: 2026, mentorName: '李导师' },
  app9: { users: '12家', mrr: '¥15万', fundingAmount: '¥300万', year: 2025, mentorName: '赵导师' },
  app10: { users: '5家', mrr: '¥60万', fundingAmount: '¥2500万', year: 2025, mentorName: '陈导师' },
  app11: { users: '8千', mrr: '¥22万', fundingAmount: '¥1200万', year: 2025, mentorName: '李导师' },
  app12: { users: '200+', mrr: '¥35万', fundingAmount: '¥1800万', year: 2025, mentorName: '王导师' },
  app13: { users: '2家', mrr: '¥12万', fundingAmount: null, year: 2025, mentorName: '陈导师' },
  app14: { users: '15家', mrr: '¥10万', fundingAmount: '¥400万', year: 2025, mentorName: '李导师' },
  app15: { users: '3家', mrr: '¥40万', fundingAmount: '¥3000万', year: 2025, mentorName: '赵导师' },
};

interface DropdownProps {
  open: boolean;
  onToggle: () => void;
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function FilterDropdown({ open, onToggle, label, children, icon }: DropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-colors',
          open
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
        )}
      >
        {icon}
        <span>{label}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 opacity-60" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        )}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2 max-h-72 overflow-y-auto"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export default function ProjectsDatabasePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [fundingOpen, setFundingOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFunding, setSelectedFunding] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const totalProjects = ALL_PROJECTS.length;

  const filtered = useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !p.projectName.toLowerCase().includes(s) &&
          !p.industry.toLowerCase().includes(s) &&
          !p.founderName.toLowerCase().includes(s) &&
          !p.tags.some((t) => t.toLowerCase().includes(s))
        ) {
          return false;
        }
      }

      if (selectedBatches.length > 0 && !selectedBatches.includes(p.batch)) {
        return false;
      }

      if (selectedIndustries.length > 0 && !selectedIndustries.includes(p.industry)) {
        return false;
      }

      if (selectedFunding !== 'all') {
        if (selectedFunding === 'unfunded') {
          if (['Pre-A轮', 'A轮', 'B轮', 'C轮'].includes(p.stage)) return false;
        } else if (selectedFunding === 'B轮+') {
          if (!['B轮', 'C轮'].includes(p.stage)) return false;
        } else {
          if (p.stage !== selectedFunding) return false;
        }
      }

      return true;
    });
  }, [search, selectedBatches, selectedIndustries, selectedFunding, selectedStage]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const percent = ((filtered.length / totalProjects) * 100).toFixed(0);

  const toggleMulti = (
    arr: string[],
    setter: (v: string[]) => void,
    value: string,
  ) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 24 },
    },
  };

  const statusBadgeVariant = (status: string) => {
    if (status === 'graduated') return 'emerald';
    if (status === 'in_batch') return 'indigo';
    if (status === 'accepted') return 'violet';
    return 'slate';
  };

  const statusLabel = (status: string) => {
    if (status === 'graduated') return '已结业';
    if (status === 'in_batch') return '在营';
    if (status === 'accepted') return '已入营';
    if (status === 'submitted' || status === 'reviewing') return '评审中';
    if (status === 'reviewed') return '评审完成';
    if (status === 'rejected') return '未通过';
    return '草稿';
  };

  const batchLabel = (batch: string) => {
    const found = BATCH_OPTIONS.find((b) => b.value === batch);
    return found ? found.label : batch;
  };

  const filterCount =
    selectedBatches.length + selectedIndustries.length + (selectedFunding !== 'all' ? 1 : 0) + (selectedStage !== 'all' ? 1 : 0);

  const clearAll = () => {
    setSelectedBatches([]);
    setSelectedIndustries([]);
    setSelectedFunding('all');
    setSelectedStage('all');
    setSearch('');
    setPage(1);
  };

  return (
    <PageContainer
      title="历届项目数据库"
      subtitle="全量项目档案、数据与投融资信息"
      actions={
        <Button variant="outline" size="sm" icon={<Archive className="h-4 w-4" />}>
          导出档案
        </Button>
      }
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="搜索项目名称、行业、创始人、标签..."
                    className="w-full pl-10 pr-10 h-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-sm transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <FilterDropdown
                  open={batchOpen}
                  onToggle={() => {
                    setBatchOpen(!batchOpen);
                    setIndustryOpen(false);
                    setFundingOpen(false);
                    setStageOpen(false);
                  }}
                  label={
                    selectedBatches.length > 0
                      ? `期别 (${selectedBatches.length})`
                      : '期别'
                  }
                  icon={<Filter className="h-3.5 w-3.5" />}
                >
                  {BATCH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        toggleMulti(selectedBatches, setSelectedBatches, opt.value);
                        setPage(1);
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span className="text-slate-700">{opt.label}</span>
                      {selectedBatches.includes(opt.value) && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  open={industryOpen}
                  onToggle={() => {
                    setIndustryOpen(!industryOpen);
                    setBatchOpen(false);
                    setFundingOpen(false);
                    setStageOpen(false);
                  }}
                  label={
                    selectedIndustries.length > 0
                      ? `行业 (${selectedIndustries.length})`
                      : '行业'
                  }
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        toggleMulti(
                          selectedIndustries,
                          setSelectedIndustries,
                          opt.value,
                        );
                        setPage(1);
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span className="text-slate-700">{opt.label}</span>
                      {selectedIndustries.includes(opt.value) && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  open={fundingOpen}
                  onToggle={() => {
                    setFundingOpen(!fundingOpen);
                    setBatchOpen(false);
                    setIndustryOpen(false);
                    setStageOpen(false);
                  }}
                  label={
                    selectedFunding !== 'all'
                      ? FUNDING_OPTIONS.find((f) => f.value === selectedFunding)?.label
                      : '融资状态'
                  }
                >
                  {FUNDING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedFunding(opt.value);
                        setFundingOpen(false);
                        setPage(1);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50',
                        selectedFunding === opt.value && 'bg-indigo-50',
                      )}
                    >
                      <span
                        className={cn(
                          selectedFunding === opt.value
                            ? 'text-indigo-700 font-medium'
                            : 'text-slate-700',
                        )}
                      >
                        {opt.label}
                      </span>
                      {selectedFunding === opt.value && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </FilterDropdown>

                {filterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    清除筛选
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">
                    共找到{' '}
                    <span className="font-semibold text-indigo-700">
                      {filtered.length}
                    </span>{' '}
                    个项目
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    占历届总数 {percent}%
                  </span>
                </div>

                <div className="flex -space-x-1.5">
                  {selectedBatches.slice(0, 3).map((b) => (
                    <Badge
                      key={b}
                      variant="indigo"
                      className="text-[10px] border-white border-2"
                    >
                      {batchLabel(b)}
                    </Badge>
                  ))}
                  {selectedIndustries.slice(0, 2).map((ind) => (
                    <Badge
                      key={ind}
                      variant="violet"
                      className="text-[10px] border-white border-2"
                    >
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {paged.map((project, idx) => {
            const extra = PROJECT_EXTRA[project.id] || {
              users: '-',
              mrr: '-',
              fundingAmount: null,
              year: 2026,
              mentorName: '-',
            };
            const logoColor = LOGO_COLORS[idx % LOGO_COLORS.length];

            return (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-11 w-11 rounded-xl flex items-center justify-center shadow-sm',
                            logoColor,
                          )}
                        >
                          <span className="font-display text-lg font-bold text-white">
                            {project.projectName[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 leading-tight truncate">
                            {project.projectName}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Badge
                              variant="violet"
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {project.industry}
                            </Badge>
                            <Badge
                              variant={statusBadgeVariant(project.status) as any}
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {statusLabel(project.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <span>{batchLabel(project.batch)}</span>
                        <span className="text-slate-300">·</span>
                        <span>{extra.year}年入营</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {project.projectDescription}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users className="h-3 w-3" />
                          <span>用户规模</span>
                        </div>
                        <span className="font-medium text-slate-700">
                          {extra.users}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <TrendingUp className="h-3 w-3" />
                          <span>月营收</span>
                        </div>
                        <span className="font-medium text-slate-700">
                          {extra.mrr}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <DollarSign className="h-3 w-3" />
                          <span>融资</span>
                        </div>
                        {extra.fundingAmount ? (
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            {project.stage}
                            <span className="text-emerald-500">
                              {extra.fundingAmount}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">未披露</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <UserCheck className="h-3 w-3" />
                          <span>导师</span>
                        </div>
                        <span className="font-medium text-slate-700">
                          {extra.mentorName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        fullWidth
                        size="sm"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">没有匹配的项目</p>
            <p className="text-sm text-slate-400 mb-4">
              尝试调整筛选条件或搜索关键词
            </p>
            <Button variant="outline" onClick={clearAll}>
              清除所有筛选
            </Button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              第 {page} / {totalPages} 页 · 共 {filtered.length} 个项目
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition-colors',
                    page === p
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {p}
                </button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

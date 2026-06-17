import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  ChevronDown,
  Eye,
  Edit3,
  ClipboardCheck,
  Building2,
  FileText,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Badge,
  DataTable,
  type DataTableColumn,
  type DataTableAction,
} from '@/components/common';
import { useApplicationStore } from '@/stores/applicationStore';
import { formatStatusChinese, getStatusBadgeVariant } from '@/utils/format';
import type { Application, ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_TABS: { key: 'all' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'submitted', label: '已提交' },
  { key: 'reviewing', label: '评审中' },
  { key: 'accepted', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'in_batch', label: '已入营' },
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
  { value: '2025-Fall', label: '2025秋季加速营' },
];

export default function ApplicationsListPage() {
  const navigate = useNavigate();
  const { applications, drafts } = useApplicationStore();

  const [activeTab, setActiveTab] = useState<'all' | ApplicationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('全行业');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);

  const allApplications = useMemo(() => {
    return [...drafts, ...applications];
  }, [applications, drafts]);

  const filteredData = useMemo(() => {
    return allApplications.filter((app) => {
      if (activeTab !== 'all' && app.status !== activeTab) return false;
      if (selectedIndustry !== '全行业' && app.industry !== selectedIndustry) return false;
      if (selectedBatch !== 'all' && app.batch !== selectedBatch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          app.projectName.toLowerCase().includes(q) ||
          app.founderName.toLowerCase().includes(q) ||
          app.industry.toLowerCase().includes(q) ||
          (app.oneLiner && app.oneLiner.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allApplications, activeTab, selectedIndustry, selectedBatch, searchQuery]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allApplications.length };
    for (const app of allApplications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [allApplications]);

  const getLogoPlaceholder = (name: string) => {
    const colors = [
      'from-indigo-400 to-violet-500',
      'from-emerald-400 to-teal-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500',
      'from-sky-400 to-cyan-500',
      'from-violet-400 to-purple-500',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return (
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br shadow-sm',
          colors[idx],
        )}
      >
        {name.charAt(0)}
      </div>
    );
  };

  const columns: DataTableColumn<Application>[] = [
    {
      key: 'projectName',
      title: '项目名称',
      sortable: true,
      width: 'auto',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {getLogoPlaceholder(row.projectName)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{row.projectName}</p>
            {row.oneLiner && (
              <p className="text-xs text-slate-500 truncate mt-0.5 max-w-md">{row.oneLiner}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      title: '行业',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (row) => (
        <Badge variant="violet" className="text-xs px-2.5">
          {row.industry}
        </Badge>
      ),
    },
    {
      key: 'stage',
      title: '阶段',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (row) => <span className="text-sm text-slate-700">{row.stage}</span>,
    },
    {
      key: 'founderName',
      title: '创始人',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-600">
            {row.founderName.charAt(0)}
          </div>
          <span className="text-sm text-slate-700">{row.founderName}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: '申请日期',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (row) => (
        <span className="text-sm text-slate-600">
          {new Date(row.createdAt).toLocaleDateString('zh-CN')}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      sortable: true,
      align: 'center',
      width: '100px',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} dot className="px-2.5">
          {formatStatusChinese(row.status)}
        </Badge>
      ),
    },
  ];

  const rowActions: DataTableAction<Application>[] = [
    {
      key: 'view',
      label: '查看详情',
      icon: <Eye className="w-3.5 h-3.5" />,
      variant: 'ghost',
      onClick: (row) => navigate(`/applications/${row.id}`),
    },
    {
      key: 'edit',
      label: '继续编辑',
      icon: <Edit3 className="w-3.5 h-3.5" />,
      variant: 'secondary',
      show: (row) => row.status === 'draft' || row.status === 'submitted',
      onClick: (row) => navigate(`/applications/${row.id}/edit`),
    },
    {
      key: 'review',
      label: '开始评审',
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
      variant: 'primary',
      show: (row) => row.status === 'submitted' || row.status === 'reviewing',
      onClick: (row) => navigate(`/review/${row.id}`),
    },
  ];

  return (
    <PageContainer
      title="项目申请管理"
      subtitle="全流程管理入营项目的申请、评审与入营状态"
      actions={
        <Button
          onClick={() => navigate('/applications/new')}
          icon={<Plus className="h-4 w-4" />}
          className="shadow-md shadow-indigo-200/60"
        >
          新建申请
        </Button>
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
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-semibold',
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {tabCounts[tab.key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIndustryDropdownOpen(!industryDropdownOpen);
                    setBatchDropdownOpen(false);
                  }}
                  className="h-10 gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{selectedIndustry}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-500 transition-transform',
                      industryDropdownOpen && 'rotate-180',
                    )}
                  />
                </Button>
                {industryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                  >
                    <div className="p-1.5">
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedIndustry(opt);
                            setIndustryDropdownOpen(false);
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
                    setBatchDropdownOpen(!batchDropdownOpen);
                    setIndustryDropdownOpen(false);
                  }}
                  className="h-10 gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {BATCH_OPTIONS.find((b) => b.value === selectedBatch)?.label ?? '全部期别'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-500 transition-transform',
                      batchDropdownOpen && 'rotate-180',
                    )}
                  />
                </Button>
                {batchDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                  >
                    <div className="p-1.5">
                      {BATCH_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSelectedBatch(opt.value);
                            setBatchDropdownOpen(false);
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

        <DataTable<Application>
          columns={columns}
          data={filteredData}
          rowActions={rowActions}
          pageSize={10}
          getRowId={(row) => row.id}
          onRowClick={(row) => navigate(`/applications/${row.id}`)}
          emptyTitle="暂无项目申请"
          emptyDescription="点击右上角「新建申请」按钮开始创建第一份项目申请"
        />
      </div>
    </PageContainer>
  );
}

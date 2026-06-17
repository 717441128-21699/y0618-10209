import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Inbox,
  FilePlus2,
  FileSearch,
  Award,
  UsersRound,
  CalendarCheck,
  Activity,
  ClipboardList,
  Presentation,
  Sparkles,
  PieChart as PieChartIcon,
  Database,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent } from '@/components/common/Card';

interface PageMeta {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconVariant: 'indigo' | 'emerald' | 'amber' | 'slate';
}

const pageMetaByPrefix: Record<string, PageMeta> = {
  '/': {
    title: '仪表盘',
    subtitle: '查看加速器整体运营概览、关键指标和待办事项',
    icon: Inbox,
    iconVariant: 'indigo',
  },
  '/applications': {
    title: '申请列表',
    subtitle: '管理所有项目申请信息，跟进申请状态',
    icon: FolderOpen,
    iconVariant: 'indigo',
  },
  '/applications/new': {
    title: '新建项目申请',
    subtitle: '填写新项目的基础信息并提交申请',
    icon: FilePlus2,
    iconVariant: 'emerald',
  },
  '/reviews': {
    title: '评审中心',
    subtitle: '专家评审工作区，查看和提交项目评审意见',
    icon: Award,
    iconVariant: 'amber',
  },
  '/mentoring': {
    title: '导师辅导',
    subtitle: '导师配对管理、辅导记录和跟进事项',
    icon: UsersRound,
    iconVariant: 'emerald',
  },
  '/health': {
    title: '健康度看板',
    subtitle: '跟踪入营项目的团队、产品、市场和财务健康度',
    icon: Activity,
    iconVariant: 'emerald',
  },
  '/demo-day': {
    title: '演示日',
    subtitle: 'Demo Day 活动安排、路演顺序和评委评分',
    icon: Presentation,
    iconVariant: 'amber',
  },
  '/analytics': {
    title: '运营分析',
    subtitle: '加速器全流程运营数据洞察与漏斗分析',
    icon: PieChartIcon,
    iconVariant: 'indigo',
  },
  '/projects': {
    title: '项目数据库',
    subtitle: '全量项目信息库，支持多维度筛选与检索',
    icon: Database,
    iconVariant: 'slate',
  },
};

function getPageMeta(pathname: string): PageMeta {
  if (pathname === '/') return pageMetaByPrefix['/'];

  const direct = pageMetaByPrefix[pathname];
  if (direct) return direct;

  const segments = pathname.split('/').filter(Boolean);
  const base = `/${segments[0]}`;
  const baseMeta = pageMetaByPrefix[base] ?? {
    title: '页面建设中',
    subtitle: '该功能模块正在开发中',
    icon: Sparkles,
    iconVariant: 'indigo' as const,
  };

  const suffix = segments.slice(1).join('/');

  if (base === '/applications' && segments.length >= 2 && segments[1] !== 'new') {
    return {
      title: `申请详情`,
      subtitle: `查看申请 #${suffix.slice(0, 8)} 的完整信息与评审进度`,
      icon: FileSearch,
      iconVariant: 'indigo',
    };
  }
  if (base === '/reviews' && segments.length >= 2) {
    return {
      title: `评审详情`,
      subtitle: `评审任务 #${suffix.slice(0, 8)} 的打分与反馈`,
      icon: ClipboardList,
      iconVariant: 'amber',
    };
  }
  if (base === '/mentoring' && segments.length >= 3) {
    return {
      title: `辅导会议详情`,
      subtitle: `会议 #${segments[2].slice(0, 8)} 的记录与待办`,
      icon: CalendarCheck,
      iconVariant: 'emerald',
    };
  }
  if (base === '/health' && segments.length >= 3) {
    return {
      title: `更新健康度`,
      subtitle: `为项目 #${segments[2].slice(0, 8)} 记录本期健康指标`,
      icon: Activity,
      iconVariant: 'emerald',
    };
  }
  if (base === '/demo-day' && segments.length >= 3) {
    return {
      title: `项目评分`,
      subtitle: `为 Demo Day 项目 #${segments[2].slice(0, 8)} 提交评分`,
      icon: Sparkles,
      iconVariant: 'amber',
    };
  }
  if (base === '/projects' && segments.length >= 2) {
    return {
      title: `项目详情`,
      subtitle: `项目 #${suffix.slice(0, 8)} 的完整档案`,
      icon: FolderOpen,
      iconVariant: 'slate',
    };
  }

  return baseMeta;
}

function PlaceholderPage() {
  const location = useLocation();
  const params = useParams();
  const meta = getPageMeta(location.pathname);
  const Icon = meta.icon;

  const showStats = location.pathname === '/';

  return (
    <PageContainer
      title={meta.title}
      subtitle={meta.subtitle}
      actions={
        <>
          <Button variant="ghost" size="md">
            导出数据
          </Button>
          <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
            查看文档
          </Button>
        </>
      }
    >
      {showStats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              variant="indigo"
              title="本期申请数"
              value={128}
              trend={{ value: 23.5, label: '环比', direction: 'up' }}
              footnote="含草稿与已提交"
              icon={<Inbox className="w-5 h-5" />}
            />
            <StatCard
              variant="emerald"
              title="入营项目"
              value={12}
              trend={{ value: 4.2, label: '同比', direction: 'up' }}
              footnote="2026春季班"
              icon={<Sparkles className="w-5 h-5" />}
            />
            <StatCard
              variant="amber"
              title="待评审数"
              value={8}
              trend={{ value: 12.1, label: '较昨日', direction: 'down' }}
              footnote="截止本周日"
              icon={<Award className="w-5 h-5" />}
            />
            <StatCard
              variant="slate"
              title="辅导会议"
              value={36}
              trend={{ value: 18, label: '本月', direction: 'up' }}
              footnote="覆盖全部入营项目"
              icon={<UsersRound className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 p-0">
              <CardContent className="p-6">
                <EmptyState
                  icon={<Icon />}
                  iconVariant={meta.iconVariant}
                  title="仪表盘内容区"
                  description="这里将展示申请漏斗、项目分布、时间线等核心图表和数据模块。（占位页面）"
                  action={{
                    label: '前往申请列表',
                    icon: <ArrowRight className="w-4 h-4" />,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">快捷入口</h3>
                  <Badge variant="default">
                    3 项待办
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: '评审 智云AI助手', tone: 'warning' as const },
                    { label: '更新 绿能新材 健康度', tone: 'success' as const },
                    { label: '安排 消费级AR眼镜 辅导', tone: 'default' as const },
                  ].map((item, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                      whileHover={{ x: 2 }}
                      className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150"
                    >
                      <span className="text-sm text-slate-700">{item.label}</span>
                      <Badge variant={item.tone === 'warning' ? 'warning' : item.tone === 'success' ? 'success' : 'default'}>
                        待处理
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Icon />}
          iconVariant={meta.iconVariant}
          title={`${meta.title} · 开发中`}
          description={`本页面将承载「${meta.subtitle}」的完整功能。当前路由: ${location.pathname}${Object.keys(params).length ? '  参数: ' + JSON.stringify(params) : ''}`}
          action={{
            label: '返回上一级',
            icon: <ArrowRight className="w-4 h-4" />,
          }}
        />
      )}
    </PageContainer>
  );
}

export default PlaceholderPage;

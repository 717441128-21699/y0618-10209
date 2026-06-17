import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Home,
  Search,
  Bell,
  Plus,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const batchOptions = [
  { value: '2026-Spring', label: '2026春季' },
  { value: '2025-Fall', label: '2025秋季' },
  { value: '2025-Spring', label: '2025春季' },
];

const routeTitleMap: Record<string, { title: string; parent?: string }> = {
  '/': { title: '仪表盘' },
  '/applications': { title: '申请列表', parent: '项目流程' },
  '/applications/new': { title: '新建申请', parent: '申请列表' },
  '/reviews': { title: '评审中心', parent: '项目流程' },
  '/mentoring': { title: '导师辅导', parent: '运营管理' },
  '/health': { title: '健康度看板', parent: '运营管理' },
  '/demo-day': { title: '演示日', parent: '运营管理' },
  '/analytics': { title: '运营分析', parent: '数据中心' },
  '/projects': { title: '项目数据库', parent: '数据中心' },
};

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; to?: string }[] = [
    { label: '首页', to: '/' },
  ];

  if (pathname === '/') {
    return crumbs.slice(0, 1);
  }

  const directMatch = routeTitleMap[pathname];
  if (directMatch) {
    if (directMatch.parent) {
      crumbs.push({ label: directMatch.parent });
    }
    crumbs.push({ label: directMatch.title });
    return crumbs;
  }

  const segments = pathname.split('/').filter(Boolean);
  let builtPath = '';
  for (const seg of segments) {
    builtPath += `/${seg}`;
    const match = routeTitleMap[builtPath];
    if (match && /^[a-zA-Z]/.test(seg)) {
      if (match.parent && crumbs[crumbs.length - 1]?.label !== match.parent) {
        crumbs.push({ label: match.parent });
      }
      crumbs.push({ label: match.title, to: builtPath });
    } else if (!/^[a-zA-Z]/.test(seg)) {
      crumbs.push({ label: `详情 #${seg.slice(0, 6)}` });
    } else {
      crumbs.push({ label: seg });
    }
  }

  return crumbs;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  const [selectedBatch, setSelectedBatch] = useState(batchOptions[0].value);
  const [batchOpen, setBatchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const unreadCount = 3;

  const roleLabels: Record<string, string> = {
    admin: '管理员',
    applicant: '申请人',
    reviewer: '评审',
    mentor: '导师',
    investor: '投资人',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-16 flex-shrink-0 bg-white border-b border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center px-6 gap-4 relative z-20"
    >
      <div className="flex items-center gap-1 min-w-0">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1 min-w-0">
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            )}
            {crumb.to && idx < breadcrumbs.length - 1 ? (
              <button
                onClick={() => navigate(crumb.to!)}
                className="text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150 flex items-center gap-1.5 min-w-0"
              >
                {idx === 0 && <Home className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{crumb.label}</span>
              </button>
            ) : (
              <span
                className={cn(
                  'text-sm truncate flex items-center gap-1.5',
                  idx === breadcrumbs.length - 1
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500',
                )}
              >
                {idx === 0 && breadcrumbs.length === 1 && (
                  <Home className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className="truncate">{crumb.label}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
        className="relative"
      >
        <button
          onClick={() => setBatchOpen((v) => !v)}
          onBlur={() => setTimeout(() => setBatchOpen(false), 150)}
          className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 text-sm font-medium text-slate-700"
        >
          <span className="w-1.5 h-1.5 rounded-full gradient-indigo" />
          {batchOptions.find((b) => b.value === selectedBatch)?.label}
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
              batchOpen && 'rotate-180',
            )}
          />
        </button>
        {batchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-1.5 w-40 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden z-30"
          >
            {batchOptions.map((opt) => (
              <button
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedBatch(opt.value);
                  setBatchOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 text-sm transition-colors duration-100',
                  selectedBatch === opt.value
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50',
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索项目、申请人..."
          className="h-9 w-64 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all duration-150"
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.25, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150"
      >
        <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/applications/new')}
        className="h-9 px-3.5 rounded-lg gradient-indigo text-white text-sm font-medium flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-150"
      >
        <Plus className="w-4 h-4" />
        快速创建
      </motion.button>

      <div className="relative">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.35, ease: 'easeOut' }}
          onClick={() => setUserMenuOpen((v) => !v)}
          onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
          className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-lg border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all duration-150"
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full gradient-indigo flex items-center justify-center">
              <UserIcon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
              userMenuOpen && 'rotate-180',
            )}
          />
        </motion.button>
        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full right-0 mt-1.5 w-56 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden z-30"
          >
            <div className="p-3.5 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-900">
                {currentUser?.name ?? '未登录'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentUser?.email}
              </div>
              <div className="text-[11px] text-indigo-600 mt-1 inline-block px-2 py-0.5 rounded-full bg-indigo-50 font-medium">
                {roleLabels[currentUser?.activeViewRole ?? currentUser?.role ?? 'applicant']}
              </div>
            </div>
            <div className="py-1.5">
              <button
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-100"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                账号设置
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  logout();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-100"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

export default Header;

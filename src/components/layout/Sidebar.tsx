import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layers,
  FileText,
  Award,
  Users,
  Activity,
  Presentation,
  PieChart,
  Database,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ElementType;
  group: string;
}

const menuItems: MenuItem[] = [
  { to: '/', label: '仪表盘', icon: Layers, group: '工作台' },
  { to: '/applications', label: '申请列表', icon: FileText, group: '项目流程' },
  { to: '/reviews', label: '评审中心', icon: Award, group: '项目流程' },
  { to: '/mentoring', label: '导师辅导', icon: Users, group: '运营管理' },
  { to: '/health', label: '健康度看板', icon: Activity, group: '运营管理' },
  { to: '/demo-day', label: '演示日', icon: Presentation, group: '运营管理' },
  { to: '/analytics', label: '运营分析', icon: PieChart, group: '数据中心' },
  { to: '/projects', label: '项目数据库', icon: Database, group: '数据中心' },
];

const menuGroups = ['工作台', '项目流程', '运营管理', '数据中心'];

const roleLabels: Record<string, string> = {
  admin: '平台管理员',
  applicant: '申请人',
  reviewer: '评审专家',
  mentor: '创业导师',
  investor: '投资人',
};

function Sidebar() {
  const { currentUser } = useAuthStore();

  return (
    <aside
      className="w-[240px] flex-shrink-0 bg-slate-900 text-slate-100 flex flex-col h-screen"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="h-16 flex items-center px-5 border-b border-slate-800/60"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-indigo flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight text-white">
              创投加速器
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              Accelerator Platform
            </span>
          </div>
        </div>
      </motion.div>

      <nav className="flex-1 overflow-y-auto scroll-area py-4 px-3">
        {menuGroups.map((group, groupIdx) => {
          const items = menuItems.filter((m) => m.group === group);
          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.1 + groupIdx * 0.08,
                ease: 'easeOut',
              }}
              className="mb-5"
            >
              <div className="px-3 mb-2 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group}
                </span>
                <div className="flex-1 h-px bg-slate-800/60 mx-1" />
              </div>
              <ul className="space-y-1">
                {items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'text-white gradient-indigo shadow-md shadow-indigo-900/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70',
                          )
                        }
                        style={{
                          transitionDelay: `${idx * 15}ms`,
                        }}
                      >
                        <Icon
                          className={cn(
                            'w-4.5 h-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                            'w-[18px] h-[18px]',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            'w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200',
                            'group-hover:opacity-60 group-hover:translate-x-0',
                          )}
                        />
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        className="border-t border-slate-800/60 p-4"
      >
        {currentUser ? (
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer group">
            <div className="relative flex-shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full gradient-emerald flex items-center justify-center ring-2 ring-slate-700">
                  <UserIcon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors duration-200">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {roleLabels[currentUser.activeViewRole ?? currentUser.role]}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center py-2">
            未登录
          </div>
        )}
      </motion.div>
    </aside>
  );
}

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/ui.store';
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  BookOpen,
  CheckCircle2,
  Receipt,
  BarChart3,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const SidebarComponent: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: GraduationCap },
    { label: 'Teachers', path: '/teachers', icon: UserCheck },
    { label: 'Academic & Timetable', path: '/academic', icon: BookOpen },
    { label: 'Attendance', path: '/attendance', icon: CheckCircle2 },
    { label: 'Finance & Payments', path: '/finance', icon: Receipt },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col justify-between shrink-0 transition-all duration-200">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center space-x-3 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg">
            S
          </div>
          <div>
            <div className="font-bold text-sm text-primary tracking-wide">SECTOR</div>
            <div className="text-[10px] text-muted-foreground font-medium">Institute Admin</div>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer info badge */}
      <div className="p-4 border-t border-border text-[11px] text-muted-foreground flex items-center space-x-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <div>
          <div className="font-semibold text-foreground">Sector v1.0 Production</div>
          <div>Asia/Colombo (UTC+5:30)</div>
        </div>
      </div>
    </aside>
  );
};

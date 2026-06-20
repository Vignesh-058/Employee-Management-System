import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, DollarSign,
  FileText, Settings, LogOut, CalendarDays, Bell, Shield, ChevronLeft, ChevronRight, CheckSquare
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { disconnectSocket } from '../../hooks/useSocket';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const { data: notifData } = useNotifications();

  const role = user?.role || 'Employee';
  const unreadCount = notifData?.data?.filter((n: any) => !n.isRead)?.length || 0;

  const allLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Super Admin', 'HR Manager', 'Department Manager', 'Employee'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['Super Admin', 'HR Manager', 'Department Manager'],
    },
    {
      name: 'Departments',
      path: '/departments',
      icon: Building2,
      roles: ['Super Admin', 'HR Manager', 'Department Manager'],
    },
    {
      name: 'Task Board',
      path: '/tasks',
      icon: CheckSquare,
      roles: ['Super Admin', 'HR Manager', 'Department Manager', 'Employee'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['Super Admin', 'HR Manager', 'Department Manager', 'Employee'],
    },
    {
      name: 'Leave',
      path: '/leave',
      icon: CalendarDays,
      roles: ['Super Admin', 'HR Manager', 'Department Manager', 'Employee'],
    },
    {
      name: 'Payroll',
      path: '/payroll',
      icon: DollarSign,
      roles: ['Super Admin', 'HR Manager'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: ['Super Admin', 'HR Manager'],
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['Super Admin', 'HR Manager', 'Department Manager', 'Employee'],
      badge: unreadCount,
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: Shield,
      roles: ['Super Admin'],
    },
  ];

  const links = allLinks.filter(link => link.roles.includes(role));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-card border-r border-border transition-all duration-300 md:relative',
          collapsed ? 'w-16' : 'w-64',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      {/* Logo & Collapse */}
      <div className="flex items-center justify-between h-16 border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <img src="/favicon.png" alt="EMS Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-primary truncate tracking-wider">EMS</h1>
          </div>
        )}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileMenuOpen(false);
            } else {
              setCollapsed(c => !c);
            }
          }}
          className="p-1 rounded hover:bg-accent text-muted-foreground ml-auto"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.name}
                to={link.path}
                title={collapsed ? link.name : undefined}
                onClick={() => { if (window.innerWidth < 768) setMobileMenuOpen(false); }}
                className={cn(
                  'flex items-center px-3 py-2 mt-1 text-sm font-semibold rounded-lg transition-all relative',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed ? 'justify-center' : 'gap-3'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{link.name}</span>}
                {!collapsed && link.badge != null && link.badge > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {link.badge}
                  </span>
                )}
                {collapsed && link.badge != null && link.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-2 border-t border-border space-y-1">
        {['Super Admin', 'HR Manager'].includes(role) && (
          <Link
            to="/settings"
            title={collapsed ? 'Settings' : undefined}
            onClick={() => { if (window.innerWidth < 768) setMobileMenuOpen(false); }}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-semibold text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all',
              collapsed ? 'justify-center' : 'gap-3'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && 'Settings'}
          </Link>
        )}
        <button
          onClick={() => {
            disconnectSocket();
            dispatch(logout());
          }}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center w-full px-3 py-2 text-sm font-semibold text-destructive rounded-lg hover:bg-destructive/10 transition-all',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
    </>
  );
};

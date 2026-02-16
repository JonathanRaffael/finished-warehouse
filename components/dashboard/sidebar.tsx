'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  Send,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Incoming', href: '/dashboard/incoming', icon: Inbox },
  { label: 'After OQC', href: '/dashboard/after-oqc', icon: CheckCircle2 },
  { label: 'Deflashing', href: '/dashboard/deflashing', icon: Wrench }, // ✅ NEW
  { label: 'Outgoing', href: '/dashboard/outgoing', icon: Send },
  { label: 'Master Data', href: '/dashboard/master-data', icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Auto collapse on tablet */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
      else setCollapsed(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 h-screen flex flex-col border-r bg-slate-50 transition-all duration-300 shadow-sm',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
              HT
            </div>

            {!collapsed && (
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900">
                  PT Hang Tong Manufactory
                </p>
                <p className="text-xs text-slate-500">
                  Warehouse Management
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:block rounded-md p-1 hover:bg-slate-100 text-slate-600"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'relative group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:shadow'
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-0 h-6 w-1 rounded-r bg-blue-600',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />

                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive
                        ? 'text-blue-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />

                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t bg-white p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

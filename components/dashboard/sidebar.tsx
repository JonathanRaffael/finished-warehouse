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

/* ================= ROLE BASED MENU ================= */

const menuByRole = {
  ADMIN: [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'WIP Dashboard', href: '/dashboard/wip', icon: LayoutDashboard }
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Incoming', href: '/dashboard/incoming', icon: Inbox },
        { label: 'After OQC', href: '/dashboard/after-oqc', icon: CheckCircle2 },
        { label: 'Deflashing', href: '/dashboard/deflashing', icon: Wrench },
        { label: 'Outgoing', href: '/dashboard/outgoing', icon: Send },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Master Data', href: '/dashboard/master-data', icon: Database },
      ],
    },
  ],

  DEFLASHING: [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Deflashing', href: '/dashboard/deflashing', icon: Wrench },
      ],
    },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [role, setRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  /* ================= GET ROLE ================= */

  useEffect(() => {
    const roleCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('role='))
      ?.split('=')[1];

    const normalizedRole = roleCookie?.toUpperCase() ?? 'ADMIN';

    setRole(normalizedRole);
    setRoleLoaded(true);
  }, []);

  /* ================= AUTO COLLAPSE ================= */

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');

    const handleResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!roleLoaded) return null;

  const menus =
    menuByRole[role as keyof typeof menuByRole] ??
    menuByRole.ADMIN;

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* OVERLAY */}
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
        {/* ================= HEADER ================= */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-white to-slate-50">
  <div className="flex items-center gap-3">
    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
      HT
    </div>

    {!collapsed && (
      <div className="flex flex-col leading-tight">
        <p className="text-sm font-semibold text-slate-900">
          PT Hang Tong
        </p>
        <p className="text-xs text-slate-500">
          Warehouse System
        </p>
      </div>
    )}
  </div>

  {/* FLOATING COLLAPSE BUTTON */}
  <button
    onClick={() => setCollapsed(v => !v)}
    className={cn(
      'hidden lg:flex absolute -right-3 top-6 z-50 h-6 w-6 items-center justify-center rounded-full border bg-white shadow-md hover:bg-slate-100 transition'
    )}
  >
    {collapsed ? (
      <ChevronRight className="h-3 w-3" />
    ) : (
      <ChevronLeft className="h-3 w-3" />
    )}
  </button>
</div>

        {/* ================= NAV ================= */}
        <nav className="flex-1 px-2 py-4 space-y-4">
          {menus.map(section => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive =
  item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-in-out select-none',
                          isActive
                            ? 'bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600'
                            : 'text-slate-600 hover:bg-slate-100 hover:translate-x-[2px]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive
                              ? 'text-blue-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          )}
                        />

                        {!collapsed && (
                          <span className="whitespace-nowrap">
                            {item.label}
                          </span>
                        )}

                        {/* TOOLTIP */}
                        {collapsed && (
                          <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ================= FOOTER ================= */}
        <div className="border-t bg-white p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition select-none"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
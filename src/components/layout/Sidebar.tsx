'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  History,
  Package,
  CreditCard,
  Users,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/billing/new', label: 'New Bill', icon: Receipt, exact: true },
  { href: '/billing/history', label: 'Previous Bills', icon: History, exact: false },
  { href: '/inventory', label: 'Inventory', icon: Package, exact: false },
  { href: '/payments', label: 'Payments', icon: CreditCard, exact: false },
  { href: '/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/settings', label: 'Settings', icon: Settings, exact: false },
] as const;

function isActive(href: string, pathname: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  // /billing/[id] pages should highlight "Previous Bills"
  if (href === '/billing/history') {
    return (
      pathname === '/billing/history' ||
      (pathname.startsWith('/billing/') && pathname !== '/billing/new')
    );
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar no-print">
      <div className="flex items-center h-14 px-4 border-b border-white/10 shrink-0">
        <FileText className="size-5 text-[var(--color-accent)] mr-2.5 shrink-0" />
        <span className="text-white font-semibold text-[15px] tracking-tight">SmartBill</span>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'sidebar-nav-item',
              isActive(href, pathname, exact) && 'active'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <p className="text-[11px] text-[var(--color-muted-light)]">Smart Billing v0.1</p>
      </div>
    </aside>
  );
}

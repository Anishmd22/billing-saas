'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  History,
  Package,
  CreditCard,
  Users,
  Settings,
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
      {/* Logo header */}
      <div className="flex items-center py-3 px-4 border-b border-white/10 shrink-0">
        <Image
          src="/billio.png"
          alt="Billio"
          width={240}
          height={130}
          priority
          style={{
            height: '130px',
            width: 'auto',
            maxWidth: '100%',
            filter: 'brightness(0) invert(1)',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
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

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/10 shrink-0">
        <p className="text-[11px] text-[var(--color-muted-light)]">Billio v1.0</p>
      </div>
    </aside>
  );
}

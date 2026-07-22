'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PackageSearch,
  Users,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Resources', href: '/admin/resources', icon: PackageSearch },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'AI Knowledge Base', href: '/admin/ai', icon: Sparkles },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-sm">
          <span className="size-7 rounded-md bg-destructive flex items-center justify-center text-xs font-bold text-white">
            A
          </span>
          Admin Panel
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Admin navigation" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {isActive && (
                <ChevronRight className="size-3.5 ml-auto text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="px-3 py-4 border-t border-border shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}

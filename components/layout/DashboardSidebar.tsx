'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  History,
  Bookmark,
  User,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Search History', href: '/dashboard/history', icon: History },
  { label: 'Saved Articles', href: '/dashboard/saved', icon: Bookmark },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      toast.success('Signed out');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold text-base">
          <span className="size-7 rounded-md bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            SN
          </span>
          <span className="text-sm">Startup Navigator</span>
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Dashboard navigation" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group',
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

        <div className="pt-3 mt-3 border-t border-border">
          <Link
            href="/ai-search"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Sparkles className="size-4 shrink-0 text-primary" />
            AI Search
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

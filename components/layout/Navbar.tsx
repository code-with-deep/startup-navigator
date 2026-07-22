'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/config/navigation';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <span className="size-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
            SN
          </span>
          <span className="hidden sm:inline">Startup Navigator</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label === 'AI Search' ? (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>

        {/* Right side: theme toggle + user menu + mobile toggle */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden size-9 p-0"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}

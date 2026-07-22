'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Sun className="size-4" />
      </button>
    );
  }

  function cycle() {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  }

  return (
    <button
      onClick={cycle}
      aria-label={`Switch theme (current: ${theme})`}
      title={`Theme: ${theme}`}
      className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {theme === 'dark' ? (
        <Moon className="size-4" />
      ) : theme === 'light' ? (
        <Sun className="size-4" />
      ) : (
        <Monitor className="size-4" />
      )}
    </button>
  );
}

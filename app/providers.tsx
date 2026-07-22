'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useEffect, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/auth';

function AuthInitializer() {
  const { user, setUser, setLoading } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Only fetch if we think we have a user (from persisted store)
    // This verifies the token is still valid and syncs the latest user data
    if (user) {
      const fetchMe = () =>
        fetch('/api/auth/me')
          .then((r) => r.json())
          .then((payload: { data?: { id: string; email: string; name: string | null; role: string } }) => payload.data ?? null);

      fetchMe()
        .then(async (me) => {
          if (me) {
            setUser(me as Parameters<typeof setUser>[0]);
            return;
          }
          // Access token expired — try refresh then re-fetch
          const rr = await fetch('/api/auth/refresh', { method: 'POST' });
          if (!rr.ok) {
            setUser(null);
            return;
          }
          const me2 = await fetchMe();
          if (me2) {
            setUser(me2 as Parameters<typeof setUser>[0]);
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delay={300}>
          <AuthInitializer />
          {children}
        </TooltipProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

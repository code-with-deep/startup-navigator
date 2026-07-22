'use client';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBoundary error={error} reset={reset} heading="Dashboard failed to load" message="Try refreshing or signing out and back in." />;
}

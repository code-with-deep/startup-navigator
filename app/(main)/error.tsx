'use client';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBoundary error={error} reset={reset} heading="Page failed to load" message="Try refreshing the page." />;
}

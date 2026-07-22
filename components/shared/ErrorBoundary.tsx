'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  heading?: string;
  message?: string;
}

export default function ErrorBoundary({
  error,
  reset,
  heading = 'Something went wrong',
  message = 'Failed to load this section. Please try again.',
}: ErrorProps) {
  useEffect(() => {
    console.error('[ERROR BOUNDARY]', error.message);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4"
    >
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <div>
        <h2 className="font-semibold">{heading}</h2>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
      >
        <RefreshCcw className="size-3.5" /> Try again
      </button>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </main>
  );
}

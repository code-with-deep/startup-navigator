'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, Sparkles, RefreshCw } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useAuthStore } from '@/store/auth';
import { SearchInput } from '@/components/search/SearchInput';
import { StreamingAnswer } from '@/components/search/StreamingAnswer';

export function AISearchClient() {
  const { user } = useAuthStore();
  const { query, response, sources, isStreaming, isLoading, error, cached, search, reset } =
    useSearch();

  const hasResult = !!response || isLoading;

  return (
    <div className="space-y-8">
      {/* Search input */}
      <SearchInput
        onSearch={search}
        isLoading={isLoading || isStreaming}
        defaultValue={query}
      />

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Answer area */}
      {hasResult && (
        <StreamingAnswer
          query={query}
          response={response}
          sources={sources}
          isStreaming={isStreaming}
          isLoading={isLoading}
          cached={cached}
        />
      )}

      {/* Follow-up / reset */}
      {response && !isStreaming && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="size-3.5" />
            New search
          </button>
          {user && (
            <Link
              href="/dashboard/history"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <History className="size-3.5" />
              View search history
            </Link>
          )}
        </div>
      )}

      {/* Empty state tips */}
      {!hasResult && !error && (
        <div className="rounded-xl border border-border bg-muted/30 p-6 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">How it works</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono shrink-0">1.</span>
              You ask a question about starting or running a startup
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono shrink-0">2.</span>
              We search the knowledge base using semantic (vector) similarity
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono shrink-0">3.</span>
              GPT-4o synthesizes a concise, cited answer from the relevant articles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-mono shrink-0">4.</span>
              Sources are shown so you can read deeper
            </li>
          </ul>
          {!user && (
            <p className="mt-4 text-xs text-muted-foreground">
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              to save your search history and access personalized results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

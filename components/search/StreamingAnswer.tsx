'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, Zap, BookOpen } from 'lucide-react';
import { ArticleContent } from '@/components/shared/ArticleContent';
import type { SourceRef } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface StreamingAnswerProps {
  query: string;
  response: string;
  sources: SourceRef[];
  isStreaming: boolean;
  isLoading: boolean;
  cached: boolean;
}

export function StreamingAnswer({
  query,
  response,
  sources,
  isStreaming,
  isLoading,
  cached,
}: StreamingAnswerProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading && !response) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="size-5 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm">Searching the knowledge base…</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-6">
      {/* Answer header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Answer for:</p>
          <p className="font-semibold">{query}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {cached && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              cached
            </span>
          )}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Streaming answer */}
      <div
        className={cn(
          'rounded-xl border border-border bg-card p-6',
          isStreaming && 'border-primary/30'
        )}
      >
        <ArticleContent content={response} />
        {/* Blinking cursor while streaming */}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
        )}
      </div>

      {/* Sources */}
      {sources.length > 0 && !isStreaming && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sources
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source, i) => (
              <Link
                key={source.articleId}
                href={`/articles/${source.slug}`}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
              >
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  [{i + 1}]
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Math.round(source.similarity * 100)}% relevant
                  </p>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

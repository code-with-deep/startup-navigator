'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Article {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  chunkCount: number;
  createdAt: Date;
  topic?: { name: string; slug: string } | null;
}

export function AIKnowledgeBase({ articles: initialArticles }: { articles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [embedding, setEmbedding] = useState<Set<string>>(new Set());
  const [embeddingAll, setEmbeddingAll] = useState(false);

  async function reEmbed(id: string) {
    setEmbedding((p) => new Set(p).add(id));
    try {
      const res = await fetch(`/api/embed/${id}`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        toast.error(json.error ?? 'Embedding failed');
        return;
      }
      const json = await res.json() as { data?: { chunks?: number } };
      const chunks = json.data?.chunks ?? 0;
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, chunkCount: chunks } : a)
      );
      toast.success(`Embedded ${chunks} chunk${chunks !== 1 ? 's' : ''}`);
    } finally {
      setEmbedding((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  }

  async function reEmbedAll() {
    setEmbeddingAll(true);
    try {
      const res = await fetch('/api/admin/embed-all', { method: 'POST' });
      const json = await res.json() as { data?: { embedded?: number; failed?: number; totalChunks?: number } };
      if (!res.ok) {
        toast.error('Batch embedding failed');
        return;
      }
      const d = json.data ?? {};
      toast.success(
        `Embedded ${d.embedded ?? 0} articles (${d.totalChunks ?? 0} chunks). Failed: ${d.failed ?? 0}`
      );
      // Refresh counts
      const refreshRes = await fetch('/admin/ai', { cache: 'no-store' });
      if (refreshRes.ok) {
        // Re-fetch via API would need a dedicated endpoint; for now just reload
        window.location.reload();
      }
    } finally {
      setEmbeddingAll(false);
    }
  }

  const totalChunks = articles.reduce((s, a) => s + a.chunkCount, 0);
  const embeddedCount = articles.filter((a) => a.chunkCount > 0).length;

  return (
    <div className="space-y-4">
      {/* Summary + re-embed all */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <strong className="text-foreground">{embeddedCount}</strong> / {articles.length} embedded
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{totalChunks}</strong> total chunks
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={reEmbedAll}
          disabled={embeddingAll}
        >
          {embeddingAll ? (
            <><Loader2 className="size-3.5 animate-spin" /> Embedding all…</>
          ) : (
            <><Sparkles className="size-3.5" /> Re-embed All Published</>
          )}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Article</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Topic</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Embedding</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((a) => {
              const isEmbedding = embedding.has(a.id);
              const hasEmbedding = a.chunkCount > 0;
              return (
                <tr key={a.id} className={cn('hover:bg-muted/30 transition-colors', isEmbedding && 'opacity-60')}>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{a.title}</p>
                    {!a.isPublished && (
                      <span className="text-xs text-muted-foreground">Draft</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">
                    {a.topic?.name ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    {hasEmbedding ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle className="size-3.5" />
                        {a.chunkCount} {a.chunkCount === 1 ? 'chunk' : 'chunks'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertCircle className="size-3.5" /> Not embedded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => reEmbed(a.id)}
                      disabled={isEmbedding || !a.isPublished}
                      title={!a.isPublished ? 'Publish article first' : 'Re-embed'}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ml-auto',
                        a.isPublished
                          ? 'text-primary hover:bg-primary/10 hover:text-primary'
                          : 'text-muted-foreground cursor-not-allowed opacity-50'
                      )}
                    >
                      {isEmbedding ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                      {isEmbedding ? 'Embedding…' : 'Re-embed'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

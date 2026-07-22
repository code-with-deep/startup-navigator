'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Search,
  Clock,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/date';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchRecord {
  id: string;
  query: string;
  response: string | null;
  createdAt: Date | string;
  isCached: boolean;
  responseTime: number | null;
}

export function HistoryClient({ initialHistory }: { initialHistory: SearchRecord[] }) {
  const [history, setHistory] = useState(initialHistory);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  async function deleteItem(id: string) {
    setDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast.success('Search deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportJSON() {
    const data = history.map(({ id, query, response, createdAt }) => ({
      id,
      query,
      response,
      date: new Date(createdAt).toISOString(),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (history.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <Search className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No searches yet.</p>
          <Link
            href="/ai-search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Sparkles className="size-4" /> Try AI Search
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{history.length} searches</p>
        <button
          onClick={exportJSON}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
        >
          <Download className="size-3.5" /> Export JSON
        </button>
      </div>

      {/* List */}
      {history.map((item) => {
        const isExpanded = expanded.has(item.id);
        const isDeleting = deleting.has(item.id);

        return (
          <Card
            key={item.id}
            className={cn(
              'transition-all',
              isDeleting && 'opacity-50 pointer-events-none'
            )}
          >
            <CardContent className="pt-4 pb-3 space-y-2">
              {/* Query row */}
              <div className="flex items-start gap-3">
                <Search className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.query}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.isCached && (
                      <span className="px-1.5 py-0.5 rounded-full bg-muted">cached</span>
                    )}
                    {item.responseTime && (
                      <span>{(item.responseTime / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.response && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Expandable response */}
              {isExpanded && item.response && (
                <div className="ml-7 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
                    {item.response.slice(0, 500)}{item.response.length > 500 ? '…' : ''}
                  </p>
                  <Link
                    href={`/ai-search?q=${encodeURIComponent(item.query)}`}
                    className="inline-block mt-2 text-xs text-primary hover:underline"
                  >
                    Re-run this search →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

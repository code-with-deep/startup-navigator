'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkX, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SavedItem {
  articleId: string;
  savedAt: Date | string;
  article?: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    readingTime: number | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    stage: 'idea' | 'early' | 'growth' | 'scale';
    tags: string[];
    topic?: { name: string; slug: string; color: string | null } | null;
  } | null;
}

const difficultyColor = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export function SavedArticlesClient({ initialSaved }: { initialSaved: SavedItem[] }) {
  const [saved, setSaved] = useState(initialSaved);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [topicFilter, setTopicFilter] = useState<string>('');

  // Extract unique topics
  const topics = Array.from(
    new Map(
      saved
        .map((s) => s.article?.topic)
        .filter(Boolean)
        .map((t) => [t!.slug, t!])
    ).values()
  );

  const filtered = topicFilter
    ? saved.filter((s) => s.article?.topic?.slug === topicFilter)
    : saved;

  async function unsave(articleId: string) {
    setRemoving((prev) => new Set(prev).add(articleId));
    try {
      const res = await fetch(`/api/saved/${articleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSaved((prev) => prev.filter((s) => s.articleId !== articleId));
      toast.success('Removed from saved');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  }

  if (saved.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Bookmark className="size-8 mx-auto mb-3" />
        <p className="mb-4">No saved articles yet.</p>
        <Link
          href="/explore"
          className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Browse Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topic filter */}
      {topics.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <button
            onClick={() => setTopicFilter('')}
            className={cn(
              'px-3 py-1 rounded-full text-sm transition-colors',
              topicFilter === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            All
          </button>
          {topics.map((t) => (
            <button
              key={t.slug}
              onClick={() => setTopicFilter(t.slug)}
              className={cn(
                'px-3 py-1 rounded-full text-sm transition-colors',
                topicFilter === t.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const article = item.article;
          if (!article) return null;
          const isRemoving = removing.has(item.articleId);

          return (
            <Card
              key={item.articleId}
              className={cn(
                'flex flex-col h-full transition-all',
                isRemoving && 'opacity-50 pointer-events-none'
              )}
            >
              <CardHeader className="pb-2">
                {article.topic && (
                  <p className="text-xs text-muted-foreground">{article.topic.name}</p>
                )}
                <Link
                  href={`/articles/${article.slug}`}
                  className="font-semibold leading-snug hover:text-primary transition-colors line-clamp-2"
                >
                  {article.title}
                </Link>
              </CardHeader>

              <CardContent className="pb-2 flex-1">
                {article.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}
              </CardContent>

              <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                      difficultyColor[article.difficulty]
                    )}
                  >
                    {article.difficulty}
                  </span>
                  {article.readingTime && (
                    <span className="text-xs text-muted-foreground">
                      {article.readingTime}m read
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    title="Read article"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                  <button
                    onClick={() => unsave(item.articleId)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove from saved"
                  >
                    <BookmarkX className="size-3.5" />
                  </button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

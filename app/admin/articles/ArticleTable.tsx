'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Article {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  isFeatured: boolean;
  difficulty: string;
  stage: string;
  readingTime: number | null;
  createdAt: Date;
  topic?: { name: string } | null;
}

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export function ArticleTable({ articles: initialArticles }: { articles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const filtered = search
    ? articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles;

  async function deleteArticle(id: string, slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting((p) => new Set(p).add(id));
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setArticles((p) => p.filter((a) => a.id !== id));
      toast.success('Article deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  }

  return (
    <div className="space-y-3">
      {/* Search filter */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Filter articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Topic</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Difficulty</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                  No articles found
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr
                key={a.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  deleting.has(a.id) && 'opacity-50 pointer-events-none'
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-1">{a.title}</p>
                  {a.isFeatured && (
                    <span className="text-xs text-primary">★ Featured</span>
                  )}
                </td>
                <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">
                  {a.topic?.name ?? '—'}
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                      difficultyColor[a.difficulty] ?? ''
                    )}
                  >
                    {a.difficulty}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {a.isPublished ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <Eye className="size-3" /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <EyeOff className="size-3" /> Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/articles/${a.slug}/edit`}
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="size-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteArticle(a.id, a.slug)}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

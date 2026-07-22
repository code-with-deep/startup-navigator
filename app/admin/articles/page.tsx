import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAllArticlesAdmin } from '@/lib/db/queries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArticleTable } from './ArticleTable';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Articles | Admin' };

export default async function AdminArticlesPage() {
  const { articles } = await getAllArticlesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {articles.length} articles total
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="size-4" /> New Article
        </Link>
      </div>

      <ArticleTable articles={articles} />
    </div>
  );
}

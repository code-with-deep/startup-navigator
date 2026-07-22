import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllTopics } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

export const metadata: Metadata = { title: 'New Article | Admin' };

export default async function NewArticlePage() {
  const topics = await getAllTopics();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/articles" className="p-1.5 rounded-md hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Article</h1>
      </div>
      <ArticleEditor topics={topics} />
    </div>
  );
}

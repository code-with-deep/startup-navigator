import type { Metadata } from 'next';
import { getAllArticlesWithEmbedStatus } from '@/lib/db/queries';
import { AIKnowledgeBase } from './AIKnowledgeBase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'AI Knowledge Base | Admin' };

export default async function AdminAIPage() {
  const articles = await getAllArticlesWithEmbedStatus();

  const totalChunks = articles.reduce((sum, a) => sum + a.chunkCount, 0);
  const embedded = articles.filter((a) => a.chunkCount > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {embedded}/{articles.length} articles embedded · {totalChunks} total chunks
          </p>
        </div>
      </div>

      <AIKnowledgeBase articles={articles} />
    </div>
  );
}

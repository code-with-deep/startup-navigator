import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { getAllTopics } from '@/lib/db/queries';
import { ResourceManager } from './ResourceManager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Resources | Admin' };

export default async function AdminResourcesPage() {
  const [allResources, topics] = await Promise.all([
    db.query.resources.findMany({
      orderBy: desc(resources.createdAt),
      with: { topic: { columns: { name: true, id: true } } },
    }),
    getAllTopics(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground text-sm mt-1">{allResources.length} resources</p>
      </div>
      <ResourceManager resources={allResources} topics={topics} />
    </div>
  );
}

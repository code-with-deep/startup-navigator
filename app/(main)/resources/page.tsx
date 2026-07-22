import type { Metadata } from 'next';
import { ResourceCard } from '@/components/shared/ResourceCard';
import { ResourceFilters } from '@/components/shared/ResourceFilters';
import { Link2 } from 'lucide-react';
import { getResources } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { topics } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tools & Resources',
  openGraph: { title: 'Tools & Resources | Startup Navigator', description: 'Curated tools, templates, guides and videos for startup founders.' },
  twitter: { card: 'summary_large_image' },
  description: 'Curated tools, templates, guides, and videos for startup founders.',
};

type SearchParams = { type?: string; topic?: string };

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type, topic } = await searchParams;

  const [resourcesResult, topicListResult] = await Promise.allSettled([
    getResources(topic, type),
    db.select({ slug: topics.slug, name: topics.name }).from(topics).orderBy(topics.orderIndex),
  ]);
  const resources = resourcesResult.status === 'fulfilled' ? resourcesResult.value : [];
  const topicList = topicListResult.status === 'fulfilled' ? topicListResult.value : [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-2xl mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link2 className="size-4" />
          <span>Curated Resources</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Tools, templates, guides, and videos — handpicked for startup founders.
        </p>
      </div>

      <ResourceFilters
        topics={topicList}
        activeType={type}
        activeTopic={topic}
      />

      {resources.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No resources found for these filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={{
                ...r,
                topic: r.topic ? { ...r.topic, slug: r.topic.slug ?? '' } : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { TopicCard } from '@/components/shared/TopicCard';
import { BookOpen } from 'lucide-react';
import { db } from '@/lib/db';
import { topics, articles } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Topics',
  description: 'Browse all startup knowledge topics — from company registration to scaling.',
  openGraph: {
    title: 'Explore Topics | Startup Navigator',
    description: 'Browse all startup knowledge topics — from company registration to scaling.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Explore Topics | Startup Navigator' },
};

async function getTopicsWithCounts() {
  const rows = await db
    .select({
      slug: topics.slug,
      name: topics.name,
      description: topics.description,
      icon: topics.icon,
      color: topics.color,
      articleCount: sql<number>`COUNT(${articles.id})`,
    })
    .from(topics)
    .leftJoin(articles, eq(articles.topicId, topics.id))
    .groupBy(topics.id)
    .orderBy(topics.orderIndex);
  return rows.map((t) => ({ ...t, color: t.color ?? 'blue', icon: t.icon ?? 'Bot' }));
}

export default async function ExplorePage() {
  const topicList = await getTopicsWithCounts().catch(() => []);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-2xl mb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="size-4" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Topics</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Comprehensive guides across every stage of the startup journey. From registering your
          company to scaling your team — find the answers you need.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topicList.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>
    </div>
  );
}

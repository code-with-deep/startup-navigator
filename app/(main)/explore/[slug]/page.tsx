import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getTopicBySlug, getPublishedArticles } from '@/lib/db/queries';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { TopicIcon } from '@/components/shared/TopicIcon';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return { title: 'Topic Not Found' };
  return {
    title: topic.name,
    description: topic.description ?? `Explore articles about ${topic.name}`,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const { articles, total } = await getPublishedArticles({ topicSlug: slug, limit: 50 });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="size-4" /> All Topics
      </Link>

      <div className="flex items-start gap-4 mb-10">
        <TopicIcon icon={topic.icon ?? 'Bot'} color={topic.color ?? 'blue'} size="lg" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
          {topic.description && (
            <p className="text-muted-foreground mt-1 max-w-xl leading-relaxed">
              {topic.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {total} {total === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No articles yet for this topic.</p>
          <Link href="/explore" className="text-primary hover:underline mt-2 inline-block">
            Browse other topics →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                ...article,
                topic: article.topic
                  ? { ...article.topic, color: article.topic.color ?? 'blue' }
                  : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

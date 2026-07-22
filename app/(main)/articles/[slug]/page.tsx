import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Eye, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getArticleBySlug, incrementArticleView, getRelatedArticles } from '@/lib/db/queries';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { ArticleContent } from '@/components/shared/ArticleContent';
import { SaveArticleButton } from '@/components/shared/SaveArticleButton';
import { TopicIcon } from '@/components/shared/TopicIcon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: article.title,
    description: article.summary ?? undefined,
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      type: 'article',
    },
  };
}

const difficultyColor = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

const stageLabel = {
  idea: 'Idea Stage',
  early: 'Early Stage',
  growth: 'Growth',
  scale: 'Scaling',
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const rawArticle = await getArticleBySlug(slug);
  if (!rawArticle) notFound();

  // Normalize nullable color for components
  const article = {
    ...rawArticle,
    topic: rawArticle.topic
      ? { ...rawArticle.topic, color: rawArticle.topic.color ?? 'blue' }
      : null,
  };

  // Fire-and-forget view increment
  void incrementArticleView(rawArticle.id);

  // Related articles — direct DB query (no self-fetching)
  const relatedRaw = rawArticle.topicId
    ? await getRelatedArticles(rawArticle.topicId, rawArticle.id, 3)
    : [];

  const related = relatedRaw.map((r) => ({
    ...r,
    topic: r.topic ? { ...r.topic, color: r.topic.color ?? 'blue' } : null,
  }));

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
      {/* Back */}
      {article.topic ? (
        <Link
          href={`/explore/${article.topic.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" /> {article.topic.name}
        </Link>
      ) : (
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" /> Explore
        </Link>
      )}

      {/* Article header */}
      <header className="mb-8">
        {/* Topic badge */}
        {article.topic && (
          <div className="flex items-center gap-2 mb-4">
            <TopicIcon icon={rawArticle.topic?.icon ?? 'Bot'} color={article.topic.color} size="sm" />
            <Link
              href={`/explore/${article.topic.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {article.topic.name}
            </Link>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        {article.summary && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.summary}</p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
              difficultyColor[article.difficulty]
            )}
          >
            {article.difficulty}
          </span>
          <Badge variant="outline" className="text-xs">
            {stageLabel[article.stage]}
          </Badge>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {article.readingTime} min read
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {article.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(article.createdAt)}
            </span>
          </div>

          <div className="ml-auto">
            <SaveArticleButton articleId={article.id} />
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <Separator className="mb-8" />

      {/* Article body */}
      <ArticleContent content={article.content} className="mb-12" />

      {/* Author */}
      {article.author && (
        <div className="border border-border rounded-xl p-4 mb-12 flex items-center gap-4 bg-muted/30">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
            {article.author.name?.slice(0, 2).toUpperCase() ?? 'SN'}
          </div>
          <div>
            <p className="text-sm font-medium">{article.author.name ?? 'Startup Navigator'}</p>
            <p className="text-xs text-muted-foreground">Startup Navigator Team</p>
          </div>
        </div>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} variant="default" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

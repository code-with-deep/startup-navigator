import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { TopicCard } from '@/components/shared/TopicCard';
import { getFeaturedArticles } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { topics, articles } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Startup Navigator — AI-powered knowledge for founders',
  description:
    'Navigate company registration, funding, legal compliance, hiring and more with expert guides and AI-powered search.',
};

const stats = [
  { icon: BookOpen, label: 'Guides & Articles', value: '100+' },
  { icon: Users, label: 'Topics Covered', value: '8' },
  { icon: Zap, label: 'AI-Powered Search', value: '∞' },
];

async function getTopicsWithCounts() {
  return db
    .select({
      id: topics.id,
      slug: topics.slug,
      name: topics.name,
      description: topics.description,
      icon: topics.icon,
      color: topics.color,
      orderIndex: topics.orderIndex,
      articleCount: sql<number>`COUNT(${articles.id})`,
    })
    .from(topics)
    .leftJoin(articles, eq(articles.topicId, topics.id))
    .groupBy(topics.id)
    .orderBy(topics.orderIndex);
}

export default async function HomePage() {
  // Graceful fallback — show static hero/CTA even when DB is temporarily unavailable
  const [featuredArticlesResult, topicRowsResult] = await Promise.allSettled([
    getFeaturedArticles(6),
    getTopicsWithCounts(),
  ]);
  const featuredArticles = featuredArticlesResult.status === 'fulfilled' ? featuredArticlesResult.value : [];
  const topicRows = topicRowsResult.status === 'fulfilled' ? topicRowsResult.value : [];
  const topics2 = topicRows.map((t) => ({ ...t, color: t.color ?? 'blue', icon: t.icon ?? 'Bot' }));

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-20 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 text-center relative">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Sparkles className="size-3" />
            AI-Powered Knowledge Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Navigate Your Startup{' '}
            <span className="text-primary">Journey</span> with Confidence
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert guides on company registration, funding, legal compliance, hiring, and more.
            Ask anything — our AI searches the entire knowledge base for you.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/explore" />} className="gap-2">
              Explore Topics <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/ai-search" />} className="gap-2">
              <Sparkles className="size-4" />
              Ask AI Search
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <span className="text-2xl font-bold">{value}</span>
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics Grid ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse by Topic</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Everything you need, organized by startup stage
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics2.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      {/* ── Featured Articles ─────────────────────────────────── */}
      {featuredArticles.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-12 border-t border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Guides</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Handpicked articles for early-stage founders
              </p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              All articles <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
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
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="rounded-2xl bg-primary text-primary-foreground p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          <Sparkles className="size-8 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold">
            Have a question? Ask our AI.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            Get instant, cited answers from our entire knowledge base — no Googling required.
          </p>
          <Button variant="secondary" size="lg" className="mt-6" render={<Link href="/ai-search" />}>
            Start Asking →
          </Button>
        </div>
      </section>
    </div>
  );
}

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

// Always render at request time — never at build
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // Static pages — always included
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/ai-search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic pages — gracefully skip if DB is unavailable
  let articlePages: MetadataRoute.Sitemap = [];
  let topicPages: MetadataRoute.Sitemap = [];

  try {
    const { db } = await import('@/lib/db');
    const { articles, topics } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    const [publishedArticles, allTopics] = await Promise.all([
      db.select({ slug: articles.slug, updatedAt: articles.updatedAt })
        .from(articles)
        .where(eq(articles.isPublished, true)),
      db.select({ slug: topics.slug }).from(topics),
    ]);

    articlePages = publishedArticles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    topicPages = allTopics.map((t) => ({
      url: `${base}/explore/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — return only static pages
  }

  return [...staticPages, ...articlePages, ...topicPages];
}

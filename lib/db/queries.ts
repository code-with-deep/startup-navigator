import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './index';
import { articles, topics, resources, searches, savedArticles, users } from './schema';
import type { ArticleInput, ArticleUpdateInput } from '../validators/article';
import type { ResourceInput, ResourceUpdateInput } from '../validators/resource';

// ─── TOPICS ──────────────────────────────────────────────────────────────────

export async function getAllTopics() {
  return db.query.topics.findMany({
    orderBy: topics.orderIndex,
  });
}

export async function getTopicBySlug(slug: string) {
  return db.query.topics.findFirst({
    where: eq(topics.slug, slug),
  });
}

// ─── ARTICLES ────────────────────────────────────────────────────────────────

export interface ArticleFilters {
  topicSlug?: string;
  stage?: 'idea' | 'early' | 'growth' | 'scale';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getPublishedArticles(filters: ArticleFilters = {}) {
  const { topicSlug, stage, difficulty, featured, search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  // If filtering by topic slug we need the topic id first
  let topicId: number | undefined;
  if (topicSlug) {
    const topic = await db.query.topics.findFirst({
      where: eq(topics.slug, topicSlug),
      columns: { id: true },
    });
    topicId = topic?.id;
    // If slug is invalid, return empty result set immediately
    if (topicId === undefined) return { articles: [], total: 0, page, limit, hasMore: false };
  }

  const where = and(
    eq(articles.isPublished, true),
    topicId ? eq(articles.topicId, topicId) : undefined,
    stage ? eq(articles.stage, stage) : undefined,
    difficulty ? eq(articles.difficulty, difficulty) : undefined,
    featured !== undefined ? eq(articles.isFeatured, featured) : undefined,
    search
      ? or(
          ilike(articles.title, `%${search}%`),
          ilike(articles.summary, `%${search}%`)
        )
      : undefined
  );

  const [rows, countResult] = await Promise.all([
    db.query.articles.findMany({
      where,
      with: { topic: true },
      orderBy: [desc(articles.isFeatured), desc(articles.createdAt)],
      limit,
      offset,
    }),
    db.select({ count: sql<number>`COUNT(*)` }).from(articles).where(where),
  ]);

  return {
    articles: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
    hasMore: offset + rows.length < Number(countResult[0]?.count ?? 0),
  };
}

export async function getArticleBySlug(slug: string) {
  return db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.isPublished, true)),
    with: { topic: true, author: { columns: { id: true, name: true } } },
  });
}

export async function getArticleById(id: string) {
  return db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: { topic: true },
  });
}

export async function getRelatedArticles(topicId: number, excludeId: string, limit = 3) {
  return db.query.articles.findMany({
    where: and(
      eq(articles.topicId, topicId),
      eq(articles.isPublished, true),
      sql`${articles.id} != ${excludeId}`
    ),
    with: { topic: true },
    orderBy: desc(articles.createdAt),
    limit,
  });
}

export async function incrementArticleView(id: string) {
  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, id));
}

export async function getFeaturedArticles(limit = 6) {
  return db.query.articles.findMany({
    where: and(eq(articles.isPublished, true), eq(articles.isFeatured, true)),
    with: { topic: true },
    orderBy: desc(articles.createdAt),
    limit,
  });
}

// ─── RESOURCES ───────────────────────────────────────────────────────────────

export async function getResources(topicSlug?: string, type?: string) {
  const topicId = topicSlug
    ? (await getTopicBySlug(topicSlug))?.id
    : undefined;

  return db.query.resources.findMany({
    where: and(
      topicId ? eq(resources.topicId, topicId) : undefined,
      type ? eq(resources.type, type as 'tool' | 'template' | 'guide' | 'video') : undefined
    ),
    with: { topic: true },
    orderBy: [desc(resources.isFeatured), desc(resources.createdAt)],
  });
}

// ─── SEARCHES ────────────────────────────────────────────────────────────────

export async function getUserSearchHistory(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return db.query.searches.findMany({
    where: eq(searches.userId, userId),
    orderBy: desc(searches.createdAt),
    limit,
    offset,
  });
}

export async function deleteSearch(id: string, userId: string) {
  await db
    .delete(searches)
    .where(and(eq(searches.id, id), eq(searches.userId, userId)));
}

// ─── SAVED ARTICLES ──────────────────────────────────────────────────────────

export async function getSavedArticles(userId: string) {
  return db.query.savedArticles.findMany({
    where: eq(savedArticles.userId, userId),
    with: { article: { with: { topic: true } } },
    orderBy: desc(savedArticles.savedAt),
  });
}

export async function saveArticle(userId: string, articleId: string) {
  await db
    .insert(savedArticles)
    .values({ userId, articleId })
    .onConflictDoNothing();
}

export async function unsaveArticle(userId: string, articleId: string) {
  await db
    .delete(savedArticles)
    .where(
      and(eq(savedArticles.userId, userId), eq(savedArticles.articleId, articleId))
    );
}

export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  const result = await db.query.savedArticles.findFirst({
    where: and(eq(savedArticles.userId, userId), eq(savedArticles.articleId, articleId)),
    columns: { userId: true },
  });
  return !!result;
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// getAdminStats is defined further below (full implementation)

export async function getAllUsers(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return db.query.users.findMany({
    columns: { passwordHash: false, refreshTokenHash: false },
    orderBy: desc(users.createdAt),
    limit,
    offset,
  });
}

export async function toggleUserBan(id: string, isBanned: boolean) {
  const [user] = await db
    .update(users)
    .set({ isBanned, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, isBanned: users.isBanned });
  return user;
}

// ─── ARTICLE WRITE OPS ───────────────────────────────────────────────────────

export async function getAllArticlesAdmin(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db.query.articles.findMany({
      with: { topic: true, author: { columns: { id: true, name: true } } },
      orderBy: desc(articles.createdAt),
      limit,
      offset,
    }),
    db.select({ count: sql<number>`COUNT(*)` }).from(articles),
  ]);
  return {
    articles: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  };
}

export async function createArticle(data: ArticleInput, authorId: string) {
  const { slugify } = await import('../utils/slugify');
  const { calculateReadingTime } = await import('../utils/slugify');
  const slug = slugify(data.title);
  const readingTime = calculateReadingTime(data.content);

  const [article] = await db
    .insert(articles)
    .values({
      ...data,
      slug,
      readingTime,
      authorId,
    })
    .returning();
  return article;
}

export async function updateArticle(id: string, data: ArticleUpdateInput) {
  const updates: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.content) {
    const { calculateReadingTime } = await import('../utils/slugify');
    updates.readingTime = calculateReadingTime(data.content);
  }
  if (data.title) {
    const { slugify } = await import('../utils/slugify');
    updates.slug = slugify(data.title);
  }

  const [article] = await db
    .update(articles)
    .set(updates)
    .where(eq(articles.id, id))
    .returning();
  return article;
}

export async function deleteArticle(id: string) {
  await db.delete(articles).where(eq(articles.id, id));
}

// ─── RESOURCE WRITE OPS ──────────────────────────────────────────────────────

export async function getResourceById(id: string) {
  return db.query.resources.findFirst({
    where: eq(resources.id, id),
    with: { topic: true },
  });
}

export async function createResource(data: ResourceInput) {
  const [resource] = await db.insert(resources).values(data).returning();
  return resource;
}

export async function updateResource(id: string, data: ResourceUpdateInput) {
  const [resource] = await db
    .update(resources)
    .set(data)
    .where(eq(resources.id, id))
    .returning();
  return resource;
}

export async function deleteResource(id: string) {
  await db.delete(resources).where(eq(resources.id, id));
}

// ─── ADMIN STATS ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalArticles,
    publishedArticles,
    totalUsers,
    bannedUsers,
    totalSearches,
    searchesToday,
    searchesWeek,
    searchesMonth,
    cachedSearches,
    topSearches,
    userSignups,
  ] = await Promise.all([
    db.select({ count: count() }).from(articles),
    db.select({ count: count() }).from(articles).where(eq(articles.isPublished, true)),
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(eq(users.isBanned, true)),
    db.select({ count: count() }).from(searches),
    db.select({ count: count() })
      .from(searches)
      .where(sql`${searches.createdAt} >= ${todayStart.toISOString()}`),
    db.select({ count: count() })
      .from(searches)
      .where(sql`${searches.createdAt} >= ${weekStart.toISOString()}`),
    db.select({ count: count() })
      .from(searches)
      .where(sql`${searches.createdAt} >= ${monthStart.toISOString()}`),
    db.select({ count: count() })
      .from(searches)
      .where(eq(searches.isCached, true)),
    // Top 8 most searched queries
    db
      .select({ query: searches.query, cnt: count() })
      .from(searches)
      .groupBy(searches.query)
      .orderBy(desc(count()))
      .limit(8),
    // User signups per day over last 7 days
    db
      .select({
        date: sql<string>`date_trunc('day', ${users.createdAt})::date`,
        cnt: count(),
      })
      .from(users)
      .where(sql`${users.createdAt} >= ${weekStart.toISOString()}`)
      .groupBy(sql`date_trunc('day', ${users.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})::date`),
  ]);

  const total = totalSearches[0]?.count ?? 0;
  const cached = cachedSearches[0]?.count ?? 0;

  return {
    articles: {
      total: totalArticles[0]?.count ?? 0,
      published: publishedArticles[0]?.count ?? 0,
      draft: (totalArticles[0]?.count ?? 0) - (publishedArticles[0]?.count ?? 0),
    },
    users: {
      total: totalUsers[0]?.count ?? 0,
      banned: bannedUsers[0]?.count ?? 0,
      active: (totalUsers[0]?.count ?? 0) - (bannedUsers[0]?.count ?? 0),
    },
    searches: {
      total,
      today: searchesToday[0]?.count ?? 0,
      week: searchesWeek[0]?.count ?? 0,
      month: searchesMonth[0]?.count ?? 0,
      cacheHitRate: total > 0 ? Math.round((Number(cached) / Number(total)) * 100) : 0,
    },
    topSearches: topSearches.map((r) => ({ query: r.query, count: Number(r.cnt) })),
    userSignups: userSignups.map((r) => ({ date: String(r.date), count: Number(r.cnt) })),
  };
}

// ─── ADMIN ARTICLE LIST ───────────────────────────────────────────────────────

export async function getAllArticlesWithEmbedStatus() {
  const { articleEmbeddings } = await import('./schema');
  const rows = await db.query.articles.findMany({
    orderBy: desc(articles.createdAt),
    with: {
      topic: { columns: { name: true, slug: true } },
    },
  });

  const embeddedIds = await db
    .select({ articleId: articleEmbeddings.articleId, cnt: count() })
    .from(articleEmbeddings)
    .groupBy(articleEmbeddings.articleId);

  const embeddedMap = new Map(embeddedIds.map((r) => [r.articleId, Number(r.cnt)]));

  return rows.map((a) => ({
    ...a,
    chunkCount: embeddedMap.get(a.id) ?? 0,
  }));
}

// ─── ADMIN USER LIST ─────────────────────────────────────────────────────────

export async function getAllUsersAdmin(page = 1, limit = 20, search?: string) {
  const offset = (page - 1) * limit;
  const where = search ? ilike(users.email, `%${search}%`) : undefined;

  const [rows, total] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy: desc(users.createdAt),
      limit,
      offset,
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    }),
    db.select({ count: count() }).from(users).where(where),
  ]);

  return { users: rows, total: total[0]?.count ?? 0, page, limit };
}

export async function promoteToAdmin(id: string) {
  const [user] = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({ id: users.id, role: users.role });
  return user;
}

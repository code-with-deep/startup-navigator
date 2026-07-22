import { ok, serverError } from '@/lib/utils/api';
import { getAllTopics } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { articles, topics } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch topics with article counts
    const rows = await db
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

    return ok(rows);
  } catch (error) {
    return serverError(error);
  }
}

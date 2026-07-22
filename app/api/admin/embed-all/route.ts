import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { embedArticle } from '@/lib/ai/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min — embedding all articles can take a while

// POST /api/admin/embed-all — batch-embed all published articles
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    // Fetch all published articles
    const allArticles = await db
      .select({ id: articles.id, content: articles.content, title: articles.title })
      .from(articles)
      .where(eq(articles.isPublished, true));

    const results = [];
    const errors = [];

    for (const article of allArticles) {
      try {
        const result = await embedArticle(article.id, article.content);
        results.push({ title: article.title, ...result });
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        errors.push({
          articleId: article.id,
          title: article.title,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return ok({
      embedded: results.length,
      failed: errors.length,
      results,
      errors,
      totalChunks: results.reduce((sum, r) => sum + r.chunksCreated, 0),
    });
  } catch (error) {
    return serverError(error);
  }
}

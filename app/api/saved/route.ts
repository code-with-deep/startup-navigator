import { NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/utils/api';
import { getSavedArticles, saveArticle, isArticleSaved } from '@/lib/db/queries';
import { requireAuth } from '@/lib/auth/session';
// requireAuth throws Response(401) when unauthenticated — serverError() passes it through

export const dynamic = 'force-dynamic';

// GET /api/saved — returns user's saved articles
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const saved = await getSavedArticles(session.userId);
    return ok(saved);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/saved — save an article { articleId }
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json() as { articleId?: string };

    if (!body.articleId) {
      return badRequest('articleId is required');
    }

    // Idempotent — won't duplicate
    await saveArticle(session.userId, body.articleId);

    const isSaved = await isArticleSaved(session.userId, body.articleId);
    return ok({ saved: isSaved });
  } catch (error) {
    return serverError(error);
  }
}

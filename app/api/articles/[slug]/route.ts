import { NextRequest } from 'next/server';
import {
  ok,
  badRequest,
  forbidden,
  notFound,
  serverError,
} from '@/lib/utils/api';
import {
  getArticleBySlug,
  getArticleById,
  getRelatedArticles,
  incrementArticleView,
  updateArticle,
  deleteArticle,
} from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
// getSession uses Next.js cookies() — no need to pass req
import { articleUpdateSchema } from '@/lib/validators/article';
import { ZodError } from 'zod';

type Params = { params: Promise<{ slug: string }> };

// GET /api/articles/[slug] — public (increments view count)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) return notFound('Article');

    // Increment view count in background
    void incrementArticleView(article.id);

    // Related articles
    const related = article.topicId
      ? await getRelatedArticles(article.topicId, article.id, 3)
      : [];

    return ok({ ...article, related });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/articles/[slug] — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') return forbidden();

    const { slug } = await params;
    const article = await getArticleBySlug(slug) ?? await getArticleById(slug);
    if (!article) return notFound('Article');

    const body = await req.json();
    const data = articleUpdateSchema.parse(body);
    const updated = await updateArticle(article.id, data);
    return ok(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

// DELETE /api/articles/[slug] — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') return forbidden();

    const { slug } = await params;
    const article = await getArticleBySlug(slug) ?? await getArticleById(slug);
    if (!article) return notFound('Article');

    await deleteArticle(article.id);
    return ok({ message: 'Article deleted' });
  } catch (error) {
    return serverError(error);
  }
}

import { NextRequest } from 'next/server';
import { ok, created, badRequest, serverError } from '@/lib/utils/api';
import { getPublishedArticles, createArticle } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { articleSchema } from '@/lib/validators/article';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

// GET /api/articles — public, paginated, filterable
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const filters = {
      topicSlug: searchParams.get('topic') ?? undefined,
      stage: (searchParams.get('stage') as 'idea' | 'early' | 'growth' | 'scale') ?? undefined,
      difficulty:
        (searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced') ?? undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      search: searchParams.get('q') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Math.min(Number(searchParams.get('limit') ?? 12), 50),
    };

    const result = await getPublishedArticles(filters);
    return ok(result.articles, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/articles — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') {
      const { forbidden } = await import('@/lib/utils/api');
      return forbidden();
    }

    const body = await req.json();
    const data = articleSchema.parse(body);
    const article = await createArticle(data, session.userId);
    return created(article);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

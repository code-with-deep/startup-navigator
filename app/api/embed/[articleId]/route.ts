import { NextRequest } from 'next/server';
import { ok, notFound, serverError } from '@/lib/utils/api';
import { requireAdmin } from '@/lib/auth/session';
import { getArticleById } from '@/lib/db/queries';
import { embedArticle } from '@/lib/ai/embeddings';

export const runtime = 'nodejs';
export const maxDuration = 120;

type Params = { params: Promise<{ articleId: string }> };

// POST /api/embed/[articleId] — generate/refresh embeddings for one article
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { articleId } = await params;

    const article = await getArticleById(articleId);
    if (!article) return notFound('Article');

    const result = await embedArticle(article.id, article.content);

    return ok({
      articleId: result.articleId,
      chunksCreated: result.chunksCreated,
      tokensEstimate: result.tokensEstimate,
    });
  } catch (error) {
    return serverError(error);
  }
}

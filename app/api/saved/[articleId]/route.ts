import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { unsaveArticle } from '@/lib/db/queries';
import { requireAuth } from '@/lib/auth/session';

type Params = { params: Promise<{ articleId: string }> };

// DELETE /api/saved/[articleId] — remove from saved list
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { articleId } = await params;
    await unsaveArticle(session.userId, articleId);
    return ok({ saved: false });
  } catch (error) {
    return serverError(error);
  }
}

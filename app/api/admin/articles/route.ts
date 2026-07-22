import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { getAllArticlesAdmin } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET /api/admin/articles — all articles (including drafts), admin only
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get('page') ?? 1);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);

    const result = await getAllArticlesAdmin(page, limit);
    return ok(result.articles, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return serverError(error);
  }
}

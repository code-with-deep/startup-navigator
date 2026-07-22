import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { getUserSearchHistory } from '@/lib/db/queries';
import { requireAuth } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET /api/history — paginated search history for authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get('page') ?? 1);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);

    const history = await getUserSearchHistory(session.userId, page, limit);
    return ok(history, { page, limit });
  } catch (error) {
    return serverError(error);
  }
}

import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { getSession } from '@/lib/auth/session';
import { getSearchSources } from '@/lib/ai/rag';

export const dynamic = 'force-dynamic';

// GET /api/search/sources?q=... — returns source refs for the last search
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');
    if (!query) return ok([]);

    const session = await getSession();
    const sources = await getSearchSources(query, session?.userId);
    return ok(sources);
  } catch (error) {
    return serverError(error);
  }
}

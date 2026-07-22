import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { searchSchema } from '@/lib/validators/search';
import { ragSearch } from '@/lib/ai/rag';
import { getSession } from '@/lib/auth/session';
import { getSearchRatelimit } from '@/lib/cache/redis';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting (best-effort — skipped if Redis not configured) ──────────
    const ratelimit = getSearchRatelimit();
    if (ratelimit) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
      const { success, reset } = await ratelimit.limit(ip);

      if (!success) {
        return new Response(
          JSON.stringify({
            error: 'Too many searches. Please wait a moment before trying again.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        );
      }
    }

    // ── Parse + validate body ─────────────────────────────────────────────────
    const body = await req.json() as unknown;
    const { query } = searchSchema.parse(body);

    // ── Auth (optional — anonymous searches are allowed) ──────────────────────
    const session = await getSession();
    const sessionId = req.headers.get('x-session-id') ?? undefined;

    // ── RAG pipeline ──────────────────────────────────────────────────────────
    const { stream } = await ragSearch(query, session?.userId, sessionId);

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? 'Invalid query' },
        { status: 400 }
      );
    }

    console.error('[SEARCH ERROR]', error);
    return Response.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}

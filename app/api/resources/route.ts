import { NextRequest } from 'next/server';
import { ok, created, badRequest, forbidden, serverError } from '@/lib/utils/api';
import { getResources, createResource } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { resourceSchema } from '@/lib/validators/resource';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

// GET /api/resources — public, filterable by topic and type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const topic = searchParams.get('topic') ?? undefined;
    const type = searchParams.get('type') ?? undefined;

    const data = await getResources(topic, type);
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/resources — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') return forbidden();

    const body = await req.json();
    const data = resourceSchema.parse(body);
    const resource = await createResource(data);
    return created(resource);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

import { NextRequest } from 'next/server';
import { ok, badRequest, forbidden, notFound, serverError } from '@/lib/utils/api';
import { getResourceById, updateResource, deleteResource } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { resourceUpdateSchema } from '@/lib/validators/resource';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

// GET /api/resources/[id] — public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const resource = await getResourceById(id);
    if (!resource) return notFound('Resource');
    return ok(resource);
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/resources/[id] — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') return forbidden();

    const { id } = await params;
    const resource = await getResourceById(id);
    if (!resource) return notFound('Resource');

    const body = await req.json();
    const data = resourceUpdateSchema.parse(body);
    const updated = await updateResource(id, data);
    return ok(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

// DELETE /api/resources/[id] — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      const { unauthorized } = await import('@/lib/utils/api');
      return unauthorized();
    }
    if (session.role !== 'admin') return forbidden();

    const { id } = await params;
    const resource = await getResourceById(id);
    if (!resource) return notFound('Resource');

    await deleteResource(id);
    return ok({ message: 'Resource deleted' });
  } catch (error) {
    return serverError(error);
  }
}

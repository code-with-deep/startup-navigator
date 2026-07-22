import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { deleteSearch } from '@/lib/db/queries';
import { requireAuth } from '@/lib/auth/session';

type Params = { params: Promise<{ id: string }> };

// DELETE /api/history/[id] — delete a single search record (user-scoped)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await deleteSearch(id, session.userId);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}

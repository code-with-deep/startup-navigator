import { NextRequest } from 'next/server';
import { ok, badRequest, notFound, serverError } from '@/lib/utils/api';
import { toggleUserBan, promoteToAdmin } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/session';
import { z, ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

const banSchema = z.object({
  isBanned: z.boolean(),
});

const actionSchema = z.object({
  action: z.enum(['ban', 'unban', 'promote']),
});

// PATCH /api/admin/users/[id] — ban/unban/promote
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.userId) {
      return badRequest('You cannot modify your own account status');
    }

    const body = await req.json() as unknown;

    // Support both legacy { isBanned } and new { action } shapes
    const legacyParse = banSchema.safeParse(body);
    if (legacyParse.success) {
      const user = await toggleUserBan(id, legacyParse.data.isBanned);
      if (!user) return notFound('User');
      return ok(user);
    }

    const { action } = actionSchema.parse(body);

    if (action === 'promote') {
      const user = await promoteToAdmin(id);
      if (!user) return notFound('User');
      return ok(user);
    }

    const user = await toggleUserBan(id, action === 'ban');
    if (!user) return notFound('User');
    return ok(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

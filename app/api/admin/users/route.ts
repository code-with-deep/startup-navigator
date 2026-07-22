import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { getAllUsers } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET /api/admin/users — paginated users list, admin only
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get('page') ?? 1);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);

    const userList = await getAllUsers(page, limit);
    return ok(userList, { page, limit });
  } catch (error) {
    return serverError(error);
  }
}

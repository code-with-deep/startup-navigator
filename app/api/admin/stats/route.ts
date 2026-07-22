import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api';
import { getAdminStats } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats — admin only
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const stats = await getAdminStats();
    return ok(stats);
  } catch (error) {
    return serverError(error);
  }
}

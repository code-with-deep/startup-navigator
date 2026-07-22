import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { ok, serverError } from '@/lib/utils/api';

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return ok(user);
  } catch (error) {
    return serverError(error);
  }
}

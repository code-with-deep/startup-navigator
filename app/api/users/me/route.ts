import { NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/utils/api';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z, ZodError } from 'zod';

const updateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim()
    .optional(),
});

// PATCH /api/users/me — update display name
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json() as unknown;
    const { name } = updateSchema.parse(body);

    const [updated] = await db
      .update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, session.userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    return ok(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

// DELETE /api/users/me — delete account
export async function DELETE(_req: NextRequest) {
  try {
    const session = await requireAuth();

    // Prevent admin from deleting their own account
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { role: true },
    });

    if (user?.role === 'admin') {
      return badRequest('Admin accounts cannot be deleted via this endpoint');
    }

    await db.delete(users).where(eq(users.id, session.userId));

    // Return response with cleared cookies
    const { clearAuthCookies } = await import('@/lib/auth/cookies');
    const { NextResponse } = await import('next/server');
    const response = NextResponse.json({ data: { deleted: true } }, { status: 200 });
    return clearAuthCookies(response);
  } catch (error) {
    return serverError(error);
  }
}

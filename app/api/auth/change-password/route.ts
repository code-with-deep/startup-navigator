import { NextRequest } from 'next/server';
import { ok, badRequest, serverError } from '@/lib/utils/api';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

// POST /api/auth/change-password
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json() as unknown;
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Get current password hash
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { passwordHash: true },
    });

    if (!user) return badRequest('User not found');

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return badRequest('Current password is incorrect');

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({ passwordHash: newHash, refreshTokenHash: null, updatedAt: new Date() })
      .where(eq(users.id, session.userId));

    // Invalidate sessions — return response with cleared cookies
    const { clearAuthCookies } = await import('@/lib/auth/cookies');
    const { NextResponse } = await import('next/server');
    const response = NextResponse.json(
      { data: { message: 'Password changed. Please sign in again.' } },
      { status: 200 }
    );
    return clearAuthCookies(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.issues[0]?.message ?? 'Validation error');
    }
    return serverError(error);
  }
}

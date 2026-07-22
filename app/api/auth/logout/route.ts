import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Invalidate the stored refresh token so it can never be reused
      await db
        .update(users)
        .set({ refreshTokenHash: null, updatedAt: new Date() })
        .where(eq(users.id, session.userId));
    }

    const response = NextResponse.json({ success: true });
    return clearAuthCookies(response);
  } catch {
    // Always clear cookies even on error
    const response = NextResponse.json({ success: true });
    return clearAuthCookies(response);
  }
}

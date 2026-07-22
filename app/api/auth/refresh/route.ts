import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies, clearAuthCookies, getRefreshToken } from '@/lib/auth/cookies';
import { logger } from '@/lib/utils/logger';

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    // Verify JWT signature and expiry
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      const res = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
      return clearAuthCookies(res);
    }

    // Verify the token matches the stored hash (prevents reuse after rotation)
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        refreshTokenHash: true,
      },
    });

    if (!user || !user.refreshTokenHash) {
      const res = NextResponse.json({ error: 'Session not found' }, { status: 401 });
      return clearAuthCookies(res);
    }

    if (user.isBanned) {
      const res = NextResponse.json({ error: 'Account suspended' }, { status: 403 });
      return clearAuthCookies(res);
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isTokenValid) {
      // Token reuse detected — invalidate all sessions for this user
      await db.update(users).set({ refreshTokenHash: null }).where(eq(users.id, user.id));
      logger.warn(`Refresh token reuse detected for user ${user.id}`);
      const res = NextResponse.json({ error: 'Session invalidated due to suspicious activity' }, { status: 401 });
      return clearAuthCookies(res);
    }

    // Issue a fresh token pair (rotation)
    const newPayload = { userId: user.id, email: user.email, role: user.role as 'user' | 'admin' };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await db
      .update(users)
      .set({ refreshTokenHash: await bcrypt.hash(newRefreshToken, 10), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const response = NextResponse.json({ success: true });
    return setAuthCookies(response, newAccessToken, newRefreshToken);
  } catch (error) {
    logger.error('Token refresh failed', error);
    const res = NextResponse.json({ error: 'Session refresh failed' }, { status: 401 });
    return clearAuthCookies(res);
  }
}

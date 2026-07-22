import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { loginSchema } from '@/lib/validators/auth';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { logger } from '@/lib/utils/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Always hash even when user not found to prevent timing attacks
    if (!user) {
      await bcrypt.hash('dummy_password_to_prevent_timing_attack', 12);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const payload = { userId: user.id, email: user.email, role: user.role as 'user' | 'admin' };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Rotate refresh token on every login
    await db
      .update(users)
      .set({ refreshTokenHash: await bcrypt.hash(refreshToken, 10), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role,
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
    }
    logger.error('Login failed', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

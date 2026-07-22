import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validators/auth';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { logger } from '@/lib/utils/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if email is already registered
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password — cost factor 12 is production-appropriate
    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash, role: 'user' })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    const payload = { userId: user.id, email: user.email, role: user.role as 'user' | 'admin' };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store hashed refresh token for rotation validation
    await db
      .update(users)
      .set({ refreshTokenHash: await bcrypt.hash(refreshToken, 10) })
      .where(eq(users.id, user.id));

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Validation error' }, { status: 400 });
    }
    logger.error('Register failed', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

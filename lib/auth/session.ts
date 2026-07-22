import { verifyAccessToken, type TokenPayload } from './jwt';
import { getAccessToken } from './cookies';

/**
 * Server-side: returns the decoded session from the access token cookie.
 * Returns null if no token or if token is invalid/expired.
 * Use in Server Components and API route handlers.
 */
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Asserts a valid session exists.
 * Throws a Response with status 401 if not authenticated.
 * Use at the top of protected API route handlers.
 */
export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

/**
 * Asserts a valid session with admin role.
 * Throws a Response with status 403 if not admin.
 */
export async function requireAdmin(): Promise<TokenPayload> {
  const session = await requireAuth();
  if (session.role !== 'admin') {
    throw Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }
  return session;
}

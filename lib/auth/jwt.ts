import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

function getSecret(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const val = process.env[key];
  if (!val || val.startsWith('REPLACE_WITH')) {
    throw new Error(`${key} is not configured. Please set it in your .env.local file.`);
  }
  return val;
}

const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn']) || '15m';
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn']) || '7d';

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret('JWT_SECRET'), { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret('JWT_SECRET'));
  return decoded as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret('JWT_REFRESH_SECRET'));
  return decoded as TokenPayload;
}

export function decodeToken(token: string): (jwt.JwtPayload & TokenPayload) | null {
  try {
    return jwt.decode(token) as jwt.JwtPayload & TokenPayload;
  } catch {
    return null;
  }
}

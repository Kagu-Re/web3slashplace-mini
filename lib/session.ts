import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import crypto from 'crypto';

const COOKIE = 'w3sp_sid';

let ephemeralSecret: string | null = null;

function getSessionSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret) return envSecret;

  if (!ephemeralSecret) {
    ephemeralSecret = crypto.randomBytes(32).toString('hex');
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  JWT_SECRET is not set. Using an ephemeral secret for this process.');
    }
  }

  return ephemeralSecret;
}

export function createSessionCookie(address: string) {
  const secret = getSessionSecret();
  const token = jwt.sign({ address }, secret, { expiresIn: '7d' });
  return serialize(COOKIE, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  });
}

export function readAddressFromCookie(req: any): string | null {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader || '');
    if (!cookies[COOKIE]) return null;
    const secret = getSessionSecret();
    const data = jwt.verify(cookies[COOKIE], secret) as any;
    return data.address as string;
  } catch {
    return null;
  }
}

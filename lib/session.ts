import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const COOKIE = 'w3sp_sid';

export function createSessionCookie(address: string) {
  const secret = process.env.JWT_SECRET || 'devsecret';
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
    const secret = process.env.JWT_SECRET || 'devsecret';
    const data = jwt.verify(cookies[COOKIE], secret) as any;
    return data.address as string;
  } catch {
    return null;
  }
}

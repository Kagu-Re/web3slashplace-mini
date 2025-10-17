import type { NextApiRequest, NextApiResponse } from 'next';
import { createSessionCookie } from '@/lib/session';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { address } = req.body || {};
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'address required' });
  }

  // Create JWT session cookie
  const cookie = createSessionCookie(address);
  res.setHeader('Set-Cookie', cookie);
  
  res.json({ success: true, address });
}


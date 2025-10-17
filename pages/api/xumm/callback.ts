import type { NextApiRequest, NextApiResponse } from 'next';
import { XummSdk } from 'xumm-sdk';
import { createSessionCookie } from '@/lib/session';

const sdk = new XummSdk(process.env.XUMM_API_KEY || '', process.env.XUMM_API_SECRET || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { uuid } = req.query;
  if (!uuid || typeof uuid !== 'string') return res.status(400).json({ error: 'uuid required' });
  try {
    const payload = await sdk.payload.get(uuid);
    if (!payload?.response?.account) return res.status(400).json({ error: 'No account' });
    const address = payload.response.account;
    const cookie = createSessionCookie(address);
    res.setHeader('Set-Cookie', cookie);
    // redirect back home
    const base = process.env.APP_BASE_URL || 'http://localhost:3000';
    res.redirect(base + `/?xrpl=${encodeURIComponent(address)}`);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'XUMM callback error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { XummSdk } from 'xumm-sdk';
import { createSessionCookie } from '@/lib/session';

const apiKey = process.env.XUMM_API_KEY || '';
const apiSecret = process.env.XUMM_API_SECRET || '';
const sdk = new XummSdk(apiKey, apiSecret);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { uuid } = req.query;
  if (!uuid || typeof uuid !== 'string') return res.status(400).json({ error: 'uuid required' });
  
  try {
    const payload = await sdk.payload.get(uuid);
    
    if (!payload) {
      return res.status(404).json({ error: 'Payload not found' });
    }
    
    if (payload.meta.signed) {
      // Payload was signed
      const address = payload.response?.account;
      if (address) {
        // Create session cookie
        const cookie = createSessionCookie(address);
        res.setHeader('Set-Cookie', cookie);
        return res.json({ signed: true, address });
      }
    } else if (payload.meta.resolved && !payload.meta.signed) {
      // User rejected or cancelled the payload
      return res.json({ signed: false, rejected: true });
    }
    
    // Still pending
    res.json({ signed: false, rejected: false });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'XUMM status check failed' });
  }
}


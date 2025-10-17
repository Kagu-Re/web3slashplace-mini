import type { NextApiRequest, NextApiResponse } from 'next';
import { XummSdk } from 'xumm-sdk';

const apiKey = process.env.XUMM_API_KEY || '';
const apiSecret = process.env.XUMM_API_SECRET || '';

if (!apiKey || !apiSecret) {
  console.error('⚠️  XUMM credentials missing! Please set XUMM_API_KEY and XUMM_API_SECRET in .env.local');
}

const sdk = new XummSdk(apiKey, apiSecret);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  if (!apiKey || !apiSecret) {
    return res.status(500).json({ 
      error: 'XUMM not configured. Please set XUMM_API_KEY and XUMM_API_SECRET in .env.local' 
    });
  }
  
  try {
    const base = process.env.APP_BASE_URL || 'http://localhost:3000';

    // Create a SignIn payload + explicit return URL
    const payload = await sdk.payload.create(
      { 
        txjson: { TransactionType: 'SignIn' },
        return_url: { 
          app: `${base}/api/xumm/callback?uuid={id}`, 
          web: `${base}/api/xumm/callback?uuid={id}` 
        }
      }
    ) as any; // XUMM SDK types are incomplete

    if (!payload) {
      throw new Error('Failed to create XUMM payload');
    }

    // Log full payload structure for debugging
    
    // payload.next contains deeplinks; payload.refs.qr_png is the QR
    const response = {
      uuid: payload.uuid,
      // Universal deeplink that works on mobile or opens QR page  
      deeplink: payload.next?.always || payload.next?.no_push_msg_received,
      // Raw QR image (base64 data URL) to render in UI
      qr_png: payload.refs?.qr_png,
      // Also include web URL as fallback
      web_url: payload.next?.always
    };
    
    res.json(response);
  } catch (e: any) {
    console.error('XUMM create error:', e);
    res.status(500).json({ error: e.message || 'XUMM init failed' });
  }
}

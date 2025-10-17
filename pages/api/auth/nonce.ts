import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { setNonce } from '@/lib/nonceStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`📥 [NONCE] Request received: ${req.method} /api/auth/nonce`);
  console.log(`📥 [NONCE] Body:`, req.body);
  
  if (req.method !== 'POST') {
    console.log(`❌ [NONCE] Wrong method: ${req.method}, returning 405`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body || {};

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'address required' });
  }

  // Validate address format (basic check for Ethereum address)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format' });
  }

  // Generate nonce (overwrite any previous one - latest wins)
  const nonce = randomBytes(16).toString('hex');
  const key = address.toLowerCase();
  setNonce(address, nonce);
  
  console.log(`🔐 [NONCE] Generated for ${address}: ${nonce.substring(0, 10)}...`);
  console.log(`🔐 [NONCE] Stored with key: ${key}`);
  
  return res.json({ nonce });
}

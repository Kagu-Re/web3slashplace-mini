import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyMessage } from 'viem';
import { createSessionCookie } from '@/lib/session';
import { getNonce, deleteNonce } from '@/lib/nonceStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, nonce, signature } = req.body || {};

  console.log(`🔍 [VERIFY] Received verification request for ${address}`);

  // Validate inputs
  if (!address || !nonce || !signature) {
    return res.status(400).json({ error: 'address, nonce, and signature required' });
  }

  if (typeof address !== 'string' || typeof nonce !== 'string' || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Invalid input types' });
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format' });
  }

  // Get stored nonce
  const expected = getNonce(address);
  
  console.log(`🔍 [VERIFY] Looking for nonce for ${address.toLowerCase()}`);
  console.log(`🔍 [VERIFY] Expected nonce: ${expected || 'NOT FOUND'}`);
  console.log(`🔍 [VERIFY] Received nonce: ${nonce}`);
  
  if (!expected) {
    console.warn(`⚠️ [VERIFY] No nonce found for ${address}`);
    return res.status(401).json({ error: 'No nonce found for address. Please request a new nonce.' });
  }
  
  if (expected !== nonce) {
    console.warn(`⚠️ [VERIFY] Nonce mismatch for ${address}`);
    return res.status(401).json({ error: 'Nonce mismatch. Please request a new nonce.' });
  }

  // Construct the exact message that was signed
  const message = `Login nonce: ${nonce}`;

  try {
    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    // Check if signature is valid
    if (!isValid) {
      console.warn(`⚠️ [VERIFY] Signature verification failed for ${address}`);
      return res.status(401).json({ error: 'Signature verification failed: invalid signature' });
    }

    console.log(`✅ [VERIFY] Signature valid for ${address}`);

    // Delete nonce (one-time use)
    deleteNonce(address);
    console.log(`🗑️ [VERIFY] Nonce deleted for ${address}`);

    // Create session cookie
    const cookie = createSessionCookie(address);
    res.setHeader('Set-Cookie', cookie);
    console.log(`🍪 [VERIFY] Session cookie created for ${address}`);

    return res.json({ 
      ok: true, 
      address,
      message: 'Authentication successful'
    });

  } catch (error: any) {
    console.error('❌ [VERIFY] Error during verification:', error);
    return res.status(500).json({ error: 'Internal server error during signature verification' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the session cookie by setting it to expire immediately
  res.setHeader('Set-Cookie', [
    'web3sp_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
  ]);

  console.log('👋 [LOGOUT] Session cookie cleared');
  
  return res.json({ ok: true, message: 'Logged out successfully' });
}


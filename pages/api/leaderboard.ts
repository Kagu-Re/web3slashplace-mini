import type { NextApiRequest, NextApiResponse } from 'next';
import { getLeaderboard } from '@/lib/state';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const leaderboard = getLeaderboard();
  res.status(200).json({ leaderboard });
}

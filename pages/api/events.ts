import type { NextApiRequest, NextApiResponse } from 'next';
import { getEvents } from '@/lib/eventLog';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const events = getEvents();
    res.status(200).json({ events });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}


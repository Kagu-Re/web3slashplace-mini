import type { NextApiRequest, NextApiResponse } from 'next';
import { getCanvas, getSize } from '@/lib/state';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  res.json({ size: getSize(), grid: getCanvas() });
}

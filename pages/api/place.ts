import type { NextApiRequest, NextApiResponse } from 'next';
import { placePixel, setIO } from '@/lib/state';
import { readAddressFromCookie } from '@/lib/session';
import { checkIpRateLimit, getClientIp, getResetTime } from '@/lib/rateLimit';

// Validate color hex format
function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  // Match #RGB, #RRGGBB, #RGBA, #RRGGBBAA
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
}

export default function handler(req: NextApiRequest, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // IP-based rate limiting (10 requests per 10 seconds)
  // Skip rate limit for demo agents
  const { agentId } = req.body || {};
  if (!agentId) {
    const clientIp = getClientIp(req);
    if (!checkIpRateLimit(clientIp, 10, 10000)) {
      const resetInMs = getResetTime(clientIp, 10000);
      const resetInSec = Math.ceil(resetInMs / 1000);
      console.warn(`🚫 IP rate limit exceeded for ${clientIp}`);
      return res.status(429).json({ 
        error: `Too many requests. Please wait ${resetInSec} seconds.`,
        retryAfter: resetInSec
      });
    }
  }
  
  const { x, y, color } = req.body || {};
  if (typeof x !== 'number' || typeof y !== 'number') return res.status(400).json({ error: 'x,y required' });

  // Validate color format (security: prevent injection)
  if (color && !isValidHexColor(color)) {
    return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color (e.g., #FF0000)' });
  }

  // For demo mode, use agentId as address. Otherwise, read from session cookie
  const address = agentId || readAddressFromCookie(req);
  if (!address) return res.status(401).json({ error: 'Not authenticated. Please connect your wallet.' });

  // Ensure Socket.IO instance is available for broadcasting
  if (res.socket?.server?.io) {
    setIO(res.socket.server.io);
  }

  try {
    placePixel(address, x, y, color);
    res.json({ ok: true });
  } catch (e: any) {
    if (e.cooldownMs) return res.status(429).json({ error: e.message, cooldownMs: e.cooldownMs });
    res.status(400).json({ error: e.message });
  }
}

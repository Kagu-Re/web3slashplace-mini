import type { NextApiRequest } from 'next';

/**
 * IP-based rate limiting utility
 * Uses sliding window algorithm for fair rate limiting
 */

// Store: key -> array of timestamps
const requestBuckets = new Map<string, number[]>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  for (const [key, timestamps] of requestBuckets.entries()) {
    const recentRequests = timestamps.filter(t => t > fiveMinutesAgo);
    if (recentRequests.length === 0) {
      requestBuckets.delete(key);
    } else {
      requestBuckets.set(key, recentRequests);
    }
  }
}, 5 * 60 * 1000);

/**
 * Extract client IP from request, considering proxies and CDN
 */
export function getClientIp(req: NextApiRequest): string {
  // Check for forwarded IP (common with proxies/CDNs)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }

  // Check for Cloudflare connecting IP
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string') {
    return cfConnectingIp.trim();
  }

  // Fallback to socket remote address
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Check if a caller has exceeded the rate limit using a sliding window algorithm
 *
 * @param key - Identifier for the caller (IP address, agent id, etc.)
 * @param maxRequests - Maximum requests allowed in window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 10 seconds)
 * @returns true if allowed, false if rate limited
 */
export function checkIpRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 10000
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get request timestamps for this key
  const requests = requestBuckets.get(key) || [];

  // Filter to only recent requests within the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);

  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    console.warn(`⚠️ Rate limit exceeded for key ${key}: ${recentRequests.length}/${maxRequests} in ${windowMs}ms`);
    return false;
  }

  // Add current request timestamp
  recentRequests.push(now);
  requestBuckets.set(key, recentRequests);

  return true;
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(key: string, maxRequests: number = 10, windowMs: number = 10000): number {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = requestBuckets.get(key) || [];
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);

  return Math.max(0, maxRequests - recentRequests.length);
}

/**
 * Get time until rate limit resets for an identifier
 */
export function getResetTime(key: string, windowMs: number = 10000): number {
  const requests = requestBuckets.get(key) || [];
  if (requests.length === 0) return 0;

  const oldestRequest = Math.min(...requests);
  const resetTime = oldestRequest + windowMs;
  
  return Math.max(0, resetTime - Date.now());
}


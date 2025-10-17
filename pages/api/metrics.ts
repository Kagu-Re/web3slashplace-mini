import type { NextApiRequest, NextApiResponse } from 'next';
import { getCanvas, getLeaderboard } from '@/lib/state';
import { CANVAS_SIZE } from '@/lib/constants';

type MetricsResponse = {
  // Canvas stats
  placedPixels: number;
  emptyPixels: number;
  fillPercentage: string;
  
  // Player stats
  totalPlayers: number;
  activeInLast5Min: number;
  activeInLast1Hour: number;
  
  // Game stats
  largestTerritory: number;
  longestCluster: number;
  topPlayer: string;
  topPlayerReward: number;
  
  // System stats
  serverUptime: number;
  serverTime: number;
};

// Cache metrics for 5 seconds to reduce load
let metricsCache: { data: MetricsResponse, timestamp: number } | null = null;
const CACHE_MS = 5000;

export default function handler(req: NextApiRequest, res: NextApiResponse<MetricsResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();

  // Return cached data if still valid
  if (metricsCache && now - metricsCache.timestamp < CACHE_MS) {
    return res.json(metricsCache.data);
  }

  try {
    const grid = getCanvas();
    const leaderboard = getLeaderboard();

    // Calculate canvas stats
    const totalPixels = CANVAS_SIZE * CANVAS_SIZE;
    const placedPixels = grid.flat().filter(pixel => pixel !== null).length;
    const emptyPixels = totalPixels - placedPixels;
    const fillPercentage = ((placedPixels / totalPixels) * 100).toFixed(1);

    // Calculate active players
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const activeInLast5Min = leaderboard.filter(p => p.lastActive > fiveMinutesAgo).length;
    const activeInLast1Hour = leaderboard.filter(p => p.lastActive > oneHourAgo).length;

    // Calculate game stats
    const largestTerritory = leaderboard.length > 0 
      ? Math.max(...leaderboard.map(p => p.territory)) 
      : 0;
    
    const longestCluster = leaderboard.length > 0 
      ? Math.max(...leaderboard.map(p => p.largestCluster)) 
      : 0;

    const topPlayer = leaderboard.length > 0
      ? leaderboard[0].address.slice(0, 6) + '...' + leaderboard[0].address.slice(-4)
      : 'None';
    
    const topPlayerReward = leaderboard.length > 0 ? leaderboard[0].miningReward : 0;

    // Compile metrics
    const metrics: MetricsResponse = {
      // Canvas
      placedPixels,
      emptyPixels,
      fillPercentage,
      
      // Players
      totalPlayers: leaderboard.length,
      activeInLast5Min,
      activeInLast1Hour,
      
      // Game
      largestTerritory,
      longestCluster,
      topPlayer,
      topPlayerReward,
      
      // System
      serverUptime: Math.floor(process.uptime()),
      serverTime: now,
    };

    // Cache the result
    metricsCache = { data: metrics, timestamp: now };


    res.json(metrics);

  } catch (error) {
    console.error('❌ Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
}


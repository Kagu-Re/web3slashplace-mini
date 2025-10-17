import { Server as IOServer, Socket } from 'socket.io';
import { addEvent } from './eventLog';
import { 
  CANVAS_SIZE, 
  COOLDOWN_MS, 
  AUTOFILL_RANGE,
  LEADERBOARD_CACHE_MS,
  getBaseTerritoryMultiplier,
  getLineMultiplier,
  getConnectivityBonus,
  getStrategicControlBonus,
  FRAGMENTATION_PENALTY
} from './constants';

export type Pixel = { x: number; y: number; color: string; placedBy: string; placedAt: number };
export type CanvasState = (Pixel | null)[][]; // null = empty, Pixel = filled

// Singleton in-memory state
const SIZE = CANVAS_SIZE;
let canvas: CanvasState = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

// Cooldown map per address (ms)
const lastPlaceAt = new Map<string, number>();

// Sessions: sessionId -> address
const sessions = new Map<string, string>();

let io: IOServer | null = null;

export function getSize() { return SIZE; }

export function getCanvas(): CanvasState {
  return canvas;
}

export function clearCanvas() {
  canvas = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

export function setIO(server: IOServer) {
  io = server;
}

export function getIO() {
  return io;
}

// Check if a pixel is part of a connected line (protected) - simple adjacent check
export function isPixelInConnectedLine(x: number, y: number): boolean {
  const pixel = canvas[y]?.[x];
  if (!pixel) return false;

  // Check for adjacent pixels of the same color
  const neighbors = [
    canvas[y - 1]?.[x],     // up
    canvas[y + 1]?.[x],     // down
    canvas[y]?.[x - 1],     // left
    canvas[y]?.[x + 1],     // right
  ];

  const connectedCount = neighbors.filter(neighbor => 
    neighbor && neighbor.placedBy === pixel.placedBy
  ).length;

  return connectedCount >= 1; // Part of a line if connected to at least 1 neighbor
}

// Check for interference from other players in the path between two pixels
function hasInterference(x1: number, y1: number, x2: number, y2: number, owner: string): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  
  if (steps === 0) return false;
  
  const stepX = dx / steps;
  const stepY = dy / steps;
  
  // Check each step along the path
  for (let i = 1; i < steps; i++) {
    const checkX = Math.round(x1 + stepX * i);
    const checkY = Math.round(y1 + stepY * i);
    
    if (checkX < 0 || checkX >= SIZE || checkY < 0 || checkY >= SIZE) continue;
    
    const pixel = canvas[checkY]?.[checkX];
    if (pixel && pixel.placedBy !== owner) {
      return true; // Found interference from another player
    }
  }
  
  return false; // No interference found
}

// Helper function to autofill pixels between two points on the same axis
function autofillBetweenPixels(address: string, color: string, x1: number, y1: number, x2: number, y2: number) {
  const pixelsToFill: { x: number; y: number }[] = [];
  
  // Check if it's a horizontal line (same Y)
  if (y1 === y2) {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    
    // Check for interference from other players
    for (let x = startX + 1; x < endX; x++) {
      const pixel = canvas[y1][x];
      if (pixel && pixel.placedBy !== address) {
        return false; // Interference found, cannot autofill
      }
      if (!pixel) {
        pixelsToFill.push({ x, y: y1 });
      }
    }
  }
  // Check if it's a vertical line (same X)
  else if (x1 === x2) {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    
    // Check for interference from other players
    for (let y = startY + 1; y < endY; y++) {
      const pixel = canvas[y][x1];
      if (pixel && pixel.placedBy !== address) {
        return false; // Interference found, cannot autofill
      }
      if (!pixel) {
        pixelsToFill.push({ x: x1, y });
      }
    }
  }
  
  // Fill in the empty pixels
  if (pixelsToFill.length > 0) {
    
    pixelsToFill.forEach(({ x, y }) => {
      const pixel: Pixel = {
        x,
        y,
        color,
        placedBy: address,
        placedAt: Date.now()
      };
      canvas[y][x] = pixel;
      incrementPixelCount(address);
      
      // Broadcast each autofilled pixel
      if (io) {
        io.emit('pixel_placed', { x, y, color, by: address, placedAt: pixel.placedAt });
        const event = addEvent(address, x, y);
        io.emit('pixel_event', event);
      }
    });
    
    return true;
  }
  
  return false;
}

export function placePixel(address: string, x: number, y: number, color: string = '#1f2937') {
  const now = Date.now();
  const last = lastPlaceAt.get(address) ?? 0;
  
  if (now - last < COOLDOWN_MS) {
    const wait = COOLDOWN_MS - (now - last);
    const err = new Error(`Cooldown active. Wait ${Math.ceil(wait/1000)}s.`);
    (err as any).cooldownMs = wait;
    throw err;
  }
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) throw new Error('Out of bounds');
  
  // Check if pixel is already occupied (territory control)
  const existingPixel = canvas[y][x];
  if (existingPixel && existingPixel.placedBy !== address) {
    const isPartOfLine = isPixelInConnectedLine(x, y);
    
    // Check if the existing pixel is part of a protected line
    if (isPartOfLine) {
      throw new Error(`🔒 Pixel is part of a connected line! Cannot be overwritten.`);
    }
  }
  
  const pixel: Pixel = {
    x,
    y,
    color,
    placedBy: address,
    placedAt: now
  };
  
  canvas[y][x] = pixel;
  lastPlaceAt.set(address, now);
  
  // Add to event log
  const event = addEvent(address, x, y);
  
  // Update user stats
  incrementPixelCount(address);
  
  
  if (io) {
    const connectedClients = io.engine.clientsCount;
    io.emit('pixel_placed', { x, y, color, by: address, placedAt: now });
    io.emit('pixel_event', event);
  } else {
    console.warn('⚠️  Socket.IO not initialized! Pixel placed but not broadcasted.');
  }

  // --- AUTOFILL LOGIC ---
  // Check for existing pixels within range on the same axis
  // Now checks ALL directions, not just first match
  const range = AUTOFILL_RANGE;
  
  let foundHorizontal = false;
  let foundVertical = false;
  
  // Check horizontal line (same Y) - check both left and right
  for (let dx = 1; dx <= range; dx++) {
    // Check left
    const leftX = x - dx;
    if (!foundHorizontal && leftX >= 0) {
      const leftPixel = canvas[y][leftX];
      if (leftPixel && leftPixel.placedBy === address) {
        if (autofillBetweenPixels(address, color, leftX, y, x, y)) {
          foundHorizontal = true; // Mark as found but continue checking right
        }
      }
    }
    // Check right
    const rightX = x + dx;
    if (!foundHorizontal && rightX < SIZE) {
      const rightPixel = canvas[y][rightX];
      if (rightPixel && rightPixel.placedBy === address) {
        if (autofillBetweenPixels(address, color, x, y, rightX, y)) {
          foundHorizontal = true;
        }
      }
    }
  }
  
  // Check vertical line (same X) - check both up and down
  for (let dy = 1; dy <= range; dy++) {
    // Check up
    const upY = y - dy;
    if (!foundVertical && upY >= 0) {
      const upPixel = canvas[upY][x];
      if (upPixel && upPixel.placedBy === address) {
        if (autofillBetweenPixels(address, color, x, upY, x, y)) {
          foundVertical = true; // Mark as found but continue checking down
        }
      }
    }
    // Check down
    const downY = y + dy;
    if (!foundVertical && downY < SIZE) {
      const downPixel = canvas[downY][x];
      if (downPixel && downPixel.placedBy === address) {
        if (autofillBetweenPixels(address, color, x, y, x, downY)) {
          foundVertical = true;
        }
      }
    }
  }
  // --- END AUTOFILL LOGIC ---
}

export function bindSession(sessionId: string, address: string) {
  sessions.set(sessionId, address);
}

export function getAddressBySession(sessionId: string): string | null {
  return sessions.get(sessionId) ?? null;
}

// User stats for leaderboard
type UserStats = {
  pixelCount: number;
  lastActive: number; // Unix timestamp
};
const userStats = new Map<string, UserStats>();

// Leaderboard caching for performance
let leaderboardCache: { data: any[], timestamp: number } | null = null;

export function incrementPixelCount(address: string) {
  const stats = userStats.get(address) || { pixelCount: 0, lastActive: 0 };
  stats.pixelCount++;
  stats.lastActive = Date.now();
  userStats.set(address, stats);
  
  // Invalidate leaderboard cache when stats change
  leaderboardCache = null;
  
}

export function getLeaderboard() {
  // Return cached leaderboard if still valid
  const now = Date.now();
  if (leaderboardCache && now - leaderboardCache.timestamp < LEADERBOARD_CACHE_MS) {
    return leaderboardCache.data;
  }
  
  // Calculate fresh leaderboard
  const leaderboard = Array.from(userStats.entries())
    .map(([address, stats]) => { 
      const territory = calculateTerritory(address);
      const clusterStats = calculateClusterStats(address);
      const lineBonus = calculateLineBonus(address);
      const miningReward = calculateMiningReward(territory, address);
      
      return {
        address, 
        ...stats,
        territory,
        largestCluster: clusterStats.largestCluster,
        totalClusters: clusterStats.totalClusters,
        connectivityBonus: calculateConnectivityBonus(address),
        lineBonus,
        miningReward
      };
    })
    .sort((a, b) => b.miningReward - a.miningReward); // Sort by mining rewards (total value) descending
  
  // Cache the result
  leaderboardCache = {
    data: leaderboard,
    timestamp: now
  };
  
  return leaderboard;
}

// Calculate territory control for a user
export function calculateTerritory(address: string): number {
  let territory = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const pixel = canvas[y][x];
      if (pixel && pixel.placedBy === address) {
        territory++;
      }
    }
  }
  return territory;
}

// Find connected clusters of pixels for an address using simple flood fill
export function findClusters(address: string): number[][] {
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const clusters: number[][] = [];

  const floodFill = (x: number, y: number, cluster: number[]) => {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
    if (visited[y][x]) return;
    
    const pixel = canvas[y][x];
    if (!pixel || pixel.placedBy !== address) return;

    visited[y][x] = true;
    cluster.push(x, y);

    // Check adjacent pixels (up, down, left, right)
    floodFill(x + 1, y, cluster);
    floodFill(x - 1, y, cluster);
    floodFill(x, y + 1, cluster);
    floodFill(x, y - 1, cluster);
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const pixel = canvas[y][x];
      if (pixel && pixel.placedBy === address && !visited[y][x]) {
        const cluster: number[] = [];
        floodFill(x, y, cluster);
        if (cluster.length > 0) {
          clusters.push(cluster);
        }
      }
    }
  }

  return clusters;
}

// Calculate cluster statistics
export function calculateClusterStats(address: string) {
  const clusters = findClusters(address);
  const clusterSizes = clusters.map(c => c.length / 2); // Divide by 2 since we store [x, y, x, y, ...]
  
  return {
    totalClusters: clusters.length,
    largestCluster: clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0,
    averageClusterSize: clusterSizes.length > 0 ? clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length : 0,
    clusterSizes: clusterSizes.sort((a, b) => b - a) // Sort by size descending
  };
}

// Calculate bonus multiplier based on connectivity
export function calculateConnectivityBonus(address: string): number {
  const stats = calculateClusterStats(address);
  
  // Base bonus for having clusters
  let bonus = 1.0;
  
  // Bonus for largest cluster size (using constants)
  bonus += getConnectivityBonus(stats.largestCluster);
  
  // Bonus for having multiple clusters (strategic control)
  bonus += getStrategicControlBonus(stats.totalClusters);
  
  // Penalty for too many small clusters (encourages consolidation)
  if (stats.totalClusters > FRAGMENTATION_PENALTY.CLUSTER_COUNT_THRESHOLD && 
      stats.averageClusterSize < FRAGMENTATION_PENALTY.AVG_SIZE_THRESHOLD) {
    bonus *= FRAGMENTATION_PENALTY.PENALTY_MULTIPLIER;
  }
  
  return bonus;
}

// Calculate line bonuses for connected pixels
export function calculateLineBonus(address: string): number {
  const clusters = findClusters(address);
  let lineBonus = 0;
  
  clusters.forEach(cluster => {
    const clusterSize = cluster.length / 2; // Divide by 2 since we store [x, y, x, y, ...]
    
    // Apply multiplier based on cluster size (using constants)
    const multiplier = getLineMultiplier(clusterSize);
    lineBonus += clusterSize * multiplier;
  });
  
  return lineBonus;
}

// Calculate mining rewards based on territory size, connectivity, and lines
export function calculateMiningReward(territory: number, address: string): number {
  if (territory === 0) return 0;
  
  // Base reward by territory size (using constants)
  const multiplier = getBaseTerritoryMultiplier(territory);
  const baseReward = territory * multiplier;
  
  // Apply connectivity bonus
  const connectivityBonus = calculateConnectivityBonus(address);
  
  // Add line bonus
  const lineBonus = calculateLineBonus(address);
  
  const finalReward = Math.floor((baseReward + lineBonus) * connectivityBonus);
  
  
  return finalReward;
}

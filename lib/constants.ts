/**
 * Game Configuration Constants
 * 
 * Centralized configuration for easy game balance tuning.
 * All magic numbers and thresholds defined here.
 */

// ========================================
// CANVAS & GAMEPLAY
// ========================================

export const CANVAS_SIZE = 50;
export const COOLDOWN_MS = 1000; // 1 second between pixel placements
export const AUTOFILL_RANGE = 4; // Max distance for auto-connecting pixels on same axis

// ========================================
// CLIENT PERFORMANCE
// ========================================

export const LEADERBOARD_POLL_INTERVAL = 2000; // Poll leaderboard every 2 seconds
export const LEADERBOARD_CACHE_MS = 5000; // Cache leaderboard for 5 seconds
export const SOCKET_INIT_DELAY = 500; // Wait 500ms before connecting socket

// ========================================
// MINING REWARDS
// ========================================

/**
 * Base territory multipliers based on territory size
 * Larger territories get higher multipliers
 */
export const BASE_TERRITORY_MULTIPLIERS = [
  { threshold: 10, multiplier: 1 },    // < 10 pixels: 1x
  { threshold: 50, multiplier: 1.5 },  // 10-49 pixels: 1.5x
  { threshold: 100, multiplier: 2 },   // 50-99 pixels: 2x
  { threshold: Infinity, multiplier: 3 }, // 100+ pixels: 3x
] as const;

/**
 * Line/cluster bonus multipliers based on cluster size
 * Rewards building larger connected groups
 */
export const LINE_MULTIPLIERS = [
  { threshold: 3, multiplier: 1.2 },   // 3+ pixels: 1.2x
  { threshold: 5, multiplier: 1.5 },   // 5+ pixels: 1.5x
  { threshold: 10, multiplier: 2 },    // 10+ pixels: 2x
] as const;

/**
 * Connectivity bonus thresholds
 * Based on largest cluster size
 */
export const CONNECTIVITY_BONUSES = [
  { threshold: 5, bonus: 0.15 },   // 5+ connected: +15%
  { threshold: 10, bonus: 0.3 },   // 10+ connected: +30%
  { threshold: 15, bonus: 0.5 },   // 15+ connected: +50%
  { threshold: 25, bonus: 0.75 },  // 25+ connected: +75%
  { threshold: 50, bonus: 1.0 },   // 50+ connected: +100%
] as const;

/**
 * Strategic control bonus for managing multiple areas
 */
export const STRATEGIC_CONTROL_BONUSES = [
  { threshold: 3, bonus: 0.1 },  // 3+ clusters: +10%
  { threshold: 5, bonus: 0.2 },  // 5+ clusters: +20%
] as const;

/**
 * Fragmentation penalty
 * Discourages too many tiny scattered clusters
 */
export const FRAGMENTATION_PENALTY = {
  CLUSTER_COUNT_THRESHOLD: 10,
  AVG_SIZE_THRESHOLD: 3,
  PENALTY_MULTIPLIER: 0.8, // -20% if too fragmented
} as const;

// ========================================
// UI/UX
// ========================================

export const MOBILE_BREAKPOINT = 768; // px - matches Tailwind 'md' breakpoint
export const MOBILE_DEFAULT_ZOOM = 0.8;
export const DESKTOP_DEFAULT_ZOOM = 1.0;
export const DRAG_THRESHOLD = 5; // px - minimum drag distance to prevent accidental clicks

// ========================================
// VISUAL EFFECTS
// ========================================

export const GLOW_INTENSITY = {
  MIN: 0.3,   // Minimum glow for unranked/low players
  MAX: 1.0,   // Maximum glow for #1 ranked player
  DEFAULT: 0.5, // Default if no leaderboard data
} as const;

// ========================================
// DEMO MODE
// ========================================

export const DEMO_AGENTS = [
  { id: 'agent1', name: 'Agent Red', color: '#ef4444', strategy: 'aggressive' },
  { id: 'agent2', name: 'Agent Blue', color: '#3b82f6', strategy: 'defensive' },
  { id: 'agent3', name: 'Agent Green', color: '#10b981', strategy: 'pattern' },
  { id: 'agent4', name: 'Agent Purple', color: '#a855f7', strategy: 'random' },
] as const;

export const DEMO_CONFIG = {
  TICK_INTERVAL: 500, // ms - how often demo checks for actions
  AGENT_COOLDOWN: 1000, // ms - cooldown per agent (same as players)
} as const;

// ========================================
// COLOR PICKER
// ========================================

export const PREDEFINED_COLORS = [
  '#1f2937', // Dark gray
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Green
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
] as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get base territory multiplier for a given territory size
 */
export function getBaseTerritoryMultiplier(territory: number): number {
  for (const { threshold, multiplier } of BASE_TERRITORY_MULTIPLIERS) {
    if (territory < threshold) return multiplier;
  }
  return BASE_TERRITORY_MULTIPLIERS[BASE_TERRITORY_MULTIPLIERS.length - 1].multiplier;
}

/**
 * Get line multiplier for a given cluster size
 */
export function getLineMultiplier(clusterSize: number): number {
  // Start from highest threshold
  for (let i = LINE_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (clusterSize >= LINE_MULTIPLIERS[i].threshold) {
      return LINE_MULTIPLIERS[i].multiplier;
    }
  }
  return 1.0; // Base multiplier
}

/**
 * Calculate connectivity bonus for a given largest cluster size
 */
export function getConnectivityBonus(largestCluster: number): number {
  let bonus = 0;
  for (const { threshold, bonus: bonusValue } of CONNECTIVITY_BONUSES) {
    if (largestCluster >= threshold) {
      bonus = Math.max(bonus, bonusValue);
    }
  }
  return bonus;
}

/**
 * Calculate strategic control bonus for number of clusters
 */
export function getStrategicControlBonus(totalClusters: number): number {
  let bonus = 0;
  for (const { threshold, bonus: bonusValue } of STRATEGIC_CONTROL_BONUSES) {
    if (totalClusters >= threshold) {
      bonus = Math.max(bonus, bonusValue);
    }
  }
  return bonus;
}


import fs from 'fs';
import path from 'path';

export type SerializedPixel = {
  x: number;
  y: number;
  color: string;
  placedBy: string;
  placedAt: number;
};

export type PersistedState = {
  canvas: (SerializedPixel | null)[][];
  lastPlaceAt: Record<string, number>;
  userStats: Record<string, { pixelCount: number; lastActive: number }>;
};

const DEFAULT_STORAGE_PATH = path.join(process.cwd(), '.data', 'state.json');

function getStoragePath(): string {
  return process.env.STATE_STORAGE_FILE?.trim() || DEFAULT_STORAGE_PATH;
}

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readPersistedState(): PersistedState | null {
  const filePath = getStoragePath();

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as PersistedState;
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    console.error('Failed to read persisted state:', error);
    return null;
  }
}

export function writePersistedState(state: PersistedState) {
  const filePath = getStoragePath();

  try {
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist game state:', error);
  }
}

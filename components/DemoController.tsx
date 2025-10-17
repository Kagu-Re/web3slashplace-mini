'use client';

import { useState, useEffect } from 'react';

interface MockAgent {
  id: string;
  name: string;
  color: string;
  strategy: 'aggressive' | 'defensive' | 'pattern' | 'random';
  territory: number;
  pixels: number;
  lastAction: number;
}

interface DemoControllerProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onPlacePixel: (x: number, y: number, color: string, agentId: string) => void;
}

const MOCK_AGENTS: Omit<MockAgent, 'territory' | 'pixels' | 'lastAction'>[] = [
  { id: 'agent1', name: 'Red Warrior', color: '#ef4444', strategy: 'aggressive' },
  { id: 'agent2', name: 'Blue Defender', color: '#3b82f6', strategy: 'defensive' },
  { id: 'agent3', name: 'Green Artist', color: '#10b981', strategy: 'pattern' },
  { id: 'agent4', name: 'Purple Chaos', color: '#8b5cf6', strategy: 'random' },
];

export function DemoController({ isRunning, onStart, onStop, onPlacePixel }: DemoControllerProps) {
  const [agents, setAgents] = useState<MockAgent[]>([]);
  const [gameStats, setGameStats] = useState({
    totalPixels: 0,
    gameTime: 0,
    activeAgents: 0
  });

  // Initialize agents
  useEffect(() => {
    const initialAgents = MOCK_AGENTS.map(agent => ({
      ...agent,
      territory: 0,
      pixels: 0,
      lastAction: 0
    }));
    setAgents(initialAgents);
  }, []);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const gameInterval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        gameTime: prev.gameTime + 1,
        totalPixels: prev.totalPixels + 1
      }));

      // Each agent takes action based on their strategy
      agents.forEach(agent => {
        if (Date.now() - agent.lastAction < 1000) return; // 1 second cooldown per agent (same as real users)

        const action = generateAgentAction(agent);
        if (action) {
          onPlacePixel(action.x, action.y, action.color, agent.id);
          
          setAgents(prev => prev.map(a => 
            a.id === agent.id 
              ? { ...a, pixels: a.pixels + 1, lastAction: Date.now() }
              : a
          ));
        }
      });
    }, 500); // Update every 500ms for faster gameplay

    return () => clearInterval(gameInterval);
  }, [isRunning, agents, onPlacePixel]);

  const generateAgentAction = (agent: MockAgent) => {
    const x = Math.floor(Math.random() * 50);
    const y = Math.floor(Math.random() * 50);
    
    // Different strategies focused on line building
    switch (agent.strategy) {
      case 'aggressive':
        // Try to build long lines in center area
        if (Math.random() < 0.7) {
          // Focus on center area for line building
          return {
            x: x < 30 ? x + 10 : x - 10,
            y: y < 30 ? y + 10 : y - 10,
            color: agent.color
          };
        } else {
          // Random placement
          return { x, y, color: agent.color };
        }
      case 'defensive':
        // Try to build protective lines around edges
        if (Math.random() < 0.6) {
          // Build lines on edges
          return {
            x: x < 10 ? 0 : x > 40 ? 49 : x,
            y: y < 10 ? 0 : y > 40 ? 49 : y,
            color: agent.color
          };
        } else {
          // Random placement
          return { x, y, color: agent.color };
        }
      case 'pattern':
        // Try to create line-based patterns
        return generatePatternPixel(agent);
      case 'random':
        // Random placement
        return { x, y, color: agent.color };
      default:
        return { x, y, color: agent.color };
    }
  };

  const generatePatternPixel = (agent: MockAgent) => {
    const patternType = Math.floor(Math.random() * 4);
    
    switch (patternType) {
      case 0: // Horizontal line pattern
        const hx = Math.floor(Math.random() * 50);
        const hy = Math.floor(Math.random() * 10) + 20; // Center area
        return { x: hx, y: hy, color: agent.color };
        
      case 1: // Vertical line pattern
        const vx = Math.floor(Math.random() * 10) + 20; // Center area
        const vy = Math.floor(Math.random() * 50);
        return { x: vx, y: vy, color: agent.color };
        
      case 2: // Diagonal line pattern
        const dx = Math.floor(Math.random() * 30) + 10;
        const dy = dx + Math.floor(Math.random() * 5) - 2; // Diagonal-ish
        return { 
          x: Math.min(dx, 49), 
          y: Math.min(Math.max(dy, 0), 49), 
          color: agent.color 
        };
        
      case 3: // L-shape pattern
        const lx = Math.floor(Math.random() * 40) + 5;
        const ly = Math.floor(Math.random() * 40) + 5;
        // Create L-shape by placing pixels in specific positions
        if (Math.random() < 0.5) {
          return { x: lx, y: ly, color: agent.color };
        } else {
          return { x: lx + 1, y: ly, color: agent.color };
        }
    }
    
    // Fallback to random
    return { 
      x: Math.floor(Math.random() * 50), 
      y: Math.floor(Math.random() * 50), 
      color: agent.color 
    };
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">🎮 Demo Mode</h3>
          <p className="text-sm text-gray-600">AI agents building connected lines and competing for territory</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ▶️ Play Demo
            </button>
          ) : (
            <button
              onClick={onStop}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ⏹️ Stop Demo
            </button>
          )}
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{gameStats.totalPixels}</div>
          <div className="text-xs text-gray-600">Total Pixels</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{gameStats.gameTime}s</div>
          <div className="text-xs text-gray-600">Game Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{agents.length}</div>
          <div className="text-xs text-gray-600">Active Agents</div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="grid grid-cols-2 gap-2">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: agent.color }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{agent.name}</div>
              <div className="text-xs text-gray-600">{agent.pixels} pixels • {agent.strategy}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

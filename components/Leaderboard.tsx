'use client';

import { useEffect, useState } from 'react';

interface UserStats {
  address: string;
  pixelCount: number;
  lastActive: number;
  territory: number;
  largestCluster: number;
  totalClusters: number;
  connectivityBonus: number;
  lineBonus: number;
  miningReward: number;
}

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

// Removed - now calculated in lib/state.ts

export function Leaderboard({ isOpen, onToggle }: Props) {
  const [userStats, setUserStats] = useState<UserStats[]>([]);

  useEffect(() => {
    // Fetch user stats from the server
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/leaderboard?t=${Date.now()}`);
        const data = await response.json();
        setUserStats(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    fetchStats();
    
    // Update every 2 seconds for more responsive updates
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-24 right-0 z-40 bg-white/90 backdrop-blur-md shadow-lg border-l border-t border-b border-gray-200 rounded-l-xl px-3 py-4 hover:px-4 transition-all duration-200"
        title={isOpen ? 'Close Leaderboard' : 'Open Leaderboard'}
      >
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xl">{isOpen ? '→' : '🏆'}</span>
          {!isOpen && <span className="text-xs font-medium text-gray-600 writing-mode-vertical">Leaderboard</span>}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Leaderboard Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏆</span>
              <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Stats Count */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-sm text-gray-600">
              {userStats.length} active user{userStats.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {userStats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">🎨</div>
                <p className="font-medium">No activity yet</p>
                <p className="text-sm mt-1">Be the first to place a pixel!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userStats.map((user, index) => (
                  <div
                    key={user.address}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                          : index === 1
                          ? 'bg-gray-300 text-gray-700'
                          : index === 2
                          ? 'bg-orange-300 text-orange-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-800">
                          {formatAddress(user.address)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(user.lastActive)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        {user.territory || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        territory
                      </div>
                        <div className="text-xs text-blue-600 font-medium">
                          🔗 {user.largestCluster || 0} largest • {user.totalClusters || 0} clusters
                        </div>
                        <div className="text-xs text-orange-600 font-medium">
                          📏 {user.lineBonus || 0} line bonus
                        </div>
                        <div className="text-xs text-purple-600 font-medium">
                          ⚡ {((user.connectivityBonus || 1) * 100).toFixed(0)}% bonus
                        </div>
                        <div className="text-xs text-green-600 font-bold mt-1">
                          💎 {user.miningReward || 0} tokens
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

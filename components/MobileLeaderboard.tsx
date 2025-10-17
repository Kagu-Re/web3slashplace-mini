'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  address: string;
  pixels: number;
  territory: number;
  clusters: number;
  connectivity: number;
  lineBonus: number;
  miningReward: number;
}

interface MobileLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileLeaderboard({ isOpen, onClose }: MobileLeaderboardProps) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [touchStartY, setTouchStartY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      const interval = setInterval(fetchLeaderboard, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?t=${Date.now()}`);
      if (response.ok) {
        const json = await response.json();
        setData(json.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Close if swiping down more than 100px
    if (deltaY > 100) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center py-3 border-b border-gray-200">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Leaderboard</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No players yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((entry, index) => (
                <div
                  key={entry.address}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-700">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-mono text-gray-600 break-all">
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-md">
                      <span className="text-xs font-bold text-yellow-700">
                        {entry.miningReward.toFixed(0)}
                      </span>
                      <span className="text-xs text-yellow-600">tokens</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white/70 rounded px-2 py-1">
                      <p className="text-gray-500">Pixels</p>
                      <p className="font-bold text-gray-700">{entry.pixels}</p>
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1">
                      <p className="text-gray-500">Territory</p>
                      <p className="font-bold text-gray-700">{entry.territory}</p>
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1">
                      <p className="text-gray-500">Clusters</p>
                      <p className="font-bold text-gray-700">{entry.clusters}</p>
                    </div>
                  </div>

                  {/* Bonus Info */}
                  {entry.lineBonus > 0 && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded px-2 py-1 flex items-center justify-between text-xs">
                      <span className="text-green-700">Line Bonus</span>
                      <span className="font-bold text-green-800">+{entry.lineBonus.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


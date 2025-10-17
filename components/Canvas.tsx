'use client';

import { useRef, useState, useEffect } from 'react';
import { Pixel } from '@/lib/state';

type Props = {
  grid: (Pixel | null)[][] | null;
  size: number;
  onPlace: (x: number, y: number, color: string) => void;
  zoom: number;
  panX: number;
  panY: number;
  onPanChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  selectedColor: string;
  showClusters?: boolean;
  leaderboardData?: any[];
};

export function Canvas({ grid, size, onPlace, zoom, panX, panY, onPanChange, onZoomChange, selectedColor, showClusters = false, leaderboardData = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [hoveredPixel, setHoveredPixel] = useState<Pixel | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  // Pinch-to-zoom state
  const [isPinching, setIsPinching] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });

  // Helper function to calculate distance between two touch points
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to calculate center point between two touches
  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Helper function to check if a pixel is on a cluster edge
  const isClusterEdge = (x: number, y: number): boolean => {
    if (!grid || !showClusters) return false;
    const pixel = grid[y]?.[x];
    if (!pixel) return false;

    // Check if any adjacent pixel is different owner or empty
    const checks = [
      grid[y - 1]?.[x],     // up
      grid[y + 1]?.[x],     // down
      grid[y]?.[x - 1],     // left
      grid[y]?.[x + 1],     // right
    ];

    return checks.some(neighbor => !neighbor || neighbor.placedBy !== pixel.placedBy);
  };

  // Helper function to check if a pixel is part of a line (has adjacent pixels of same color)
  const isPartOfLine = (x: number, y: number): boolean => {
    if (!grid || !showClusters) return false;
    const pixel = grid[y]?.[x];
    if (!pixel) return false;

    // Check for adjacent pixels of the same color (up, down, left, right)
    const neighbors = [
      grid[y - 1]?.[x],     // up
      grid[y + 1]?.[x],     // down
      grid[y]?.[x - 1],     // left
      grid[y]?.[x + 1],     // right
    ];

    const connectedCount = neighbors.filter(neighbor => 
      neighbor && neighbor.placedBy === pixel.placedBy
    ).length;

    return connectedCount >= 1; // Part of a line if connected to at least 1 neighbor
  };

  // Helper function to get glow intensity based on leaderboard position
  const getGlowIntensity = (address: string): number => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return 0.5; // Default intensity if no leaderboard data
    }
    
    // Find the player's position in the leaderboard
    const playerIndex = leaderboardData.findIndex(player => player.address === address);
    
    if (playerIndex === -1) {
      return 0.3; // Low intensity for players not on leaderboard
    }
    
    // Calculate intensity based on position (1st place = 1.0, last place = 0.3)
    const totalPlayers = leaderboardData.length;
    const position = playerIndex + 1;
    const intensity = 1.0 - ((position - 1) / (totalPlayers - 1)) * 0.7; // Range from 1.0 to 0.3
    
    return Math.max(0.3, Math.min(1.0, intensity));
  };

  // Helper function to get line direction for visual styling
  const getLineDirection = (x: number, y: number): string => {
    if (!grid) return '';
    const pixel = grid[y]?.[x];
    if (!pixel) return '';

    const neighbors = {
      up: grid[y - 1]?.[x],
      down: grid[y + 1]?.[x],
      left: grid[y]?.[x - 1],
      right: grid[y]?.[x + 1],
    };

    const connected = Object.entries(neighbors).filter(([_, neighbor]) => 
      neighbor && neighbor.placedBy === pixel.placedBy
    ).map(([dir, _]) => dir);

    if (connected.includes('up') && connected.includes('down')) return 'vertical';
    if (connected.includes('left') && connected.includes('right')) return 'horizontal';
    if (connected.includes('up') && connected.includes('right')) return 'top-right';
    if (connected.includes('up') && connected.includes('left')) return 'top-left';
    if (connected.includes('down') && connected.includes('right')) return 'bottom-right';
    if (connected.includes('down') && connected.includes('left')) return 'bottom-left';
    if (connected.length >= 2) return 'junction';
    
    return '';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging on mouse only when zoomed
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      setDragDistance(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Two fingers - start pinch-to-zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      
      setIsPinching(true);
      setLastPinchDistance(distance);
      setPinchCenter(center);
      setIsDragging(false);
      setDragDistance(0); // Reset drag distance for pinch
    } else if (e.touches.length === 1) {
      // Single finger - start dragging
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
      setDragDistance(0);
      setIsPinching(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      onPanChange(newPanX, newPanY);
      
      // Track drag distance to prevent accidental clicks
      const distance = Math.sqrt(
        Math.pow(newPanX - panX, 2) + Math.pow(newPanY - panY, 2)
      );
      setDragDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (isPinching && e.touches.length === 2) {
      // Handle pinch-to-zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      
      if (lastPinchDistance > 0) {
        const scale = distance / lastPinchDistance;
        const newZoom = Math.max(0.5, Math.min(3, zoom * scale));
        onZoomChange(newZoom);
        
        // Adjust pan to keep the pinch center in the same place
        const zoomChange = newZoom / zoom;
        const newPanX = center.x - (center.x - panX) * zoomChange;
        const newPanY = center.y - (center.y - panY) * zoomChange;
        onPanChange(newPanX, newPanY);
      }
      
      setLastPinchDistance(distance);
      setPinchCenter(center);
    } else if (isDragging && e.touches.length === 1) {
      // Handle single finger dragging
      const touch = e.touches[0];
      const newPanX = touch.clientX - dragStart.x;
      const newPanY = touch.clientY - dragStart.y;
      onPanChange(newPanX, newPanY);
      
      // Track drag distance to prevent accidental clicks
      const distance = Math.sqrt(
        Math.pow(newPanX - panX, 2) + Math.pow(newPanY - panY, 2)
      );
      setDragDistance(distance);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      setIsDragging(false);
      setIsPinching(false);
      setLastPinchDistance(0);
      // Reset drag distance after a short delay to allow click detection
      setTimeout(() => setDragDistance(0), 100);
    } else if (e.touches.length === 1) {
      // One finger left - switch to dragging mode
      const touch = e.touches[0];
      setIsPinching(false);
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
      setDragDistance(0);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsPinching(false);
    };
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
      setIsPinching(false);
      setLastPinchDistance(0);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  if (!grid) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas…</p>
        </div>
      </div>
    );
  }

  return (
    <div
        ref={containerRef}
        className="relative flex justify-center overflow-hidden touch-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', minHeight: '650px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      <div
        className="inline-grid border-2 border-gray-300 shadow-inner"
      style={{
        gridTemplateColumns: `repeat(${size}, 12px)`,
        gridTemplateRows: `repeat(${size}, 12px)`,
        gap: 1,
          background: '#f8fafc',
          padding: 8,
          borderRadius: 12,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {grid.flatMap((row, y) =>
          row.map((pixel, x) => {
            const isEdge = isClusterEdge(x, y);
            const isLine = isPartOfLine(x, y);
            
            // Calculate glow properties
            const glowIntensity = pixel ? getGlowIntensity(pixel.placedBy) : 0;
            const glowColor = pixel ? pixel.color : '#ffffff';
            const glowOpacity = isLine ? glowIntensity : (isEdge ? glowIntensity * 0.7 : 0);
            
                return (
          <button
            key={`${x}-${y}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Prevent click if user was dragging or pinching
                      if (dragDistance > 5 || isDragging || isPinching) return;
                      onPlace(x, y, selectedColor);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only handle single touch, prevent if dragging or pinching
                      if (e.touches.length === 0 && !isDragging && !isPinching && dragDistance <= 5) {
                        onPlace(x, y, selectedColor);
                      }
                    }}
                    onMouseEnter={(e) => {
                  if (pixel) {
                    setHoveredPixel(pixel);
                    setHoverPosition({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseLeave={() => setHoveredPixel(null)}
                className={`w-3 h-3 transition-all duration-150 hover:scale-110 hover:z-10 relative ${
                  isEdge ? 'cluster-edge' : ''
                } ${isLine ? 'connected-line' : ''}`}
            style={{
                  width: 12, 
                  height: 12,
                  background: pixel ? pixel.color : '#ffffff',
              borderRadius: 2,
                  border: isLine && pixel 
                    ? `2px solid ${pixel.color}` 
                    : isEdge && pixel 
                    ? `2px solid ${pixel.color}` 
                    : pixel 
                    ? `1px solid ${pixel.color}` 
                    : '1px solid #e5e7eb',
                  boxShadow: isLine && pixel
                    ? `0 0 ${8 * glowIntensity}px ${glowColor}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}, 0 0 ${16 * glowIntensity}px ${glowColor}${Math.floor(glowOpacity * 180).toString(16).padStart(2, '0')}, 0 0 ${24 * glowIntensity}px ${glowColor}${Math.floor(glowOpacity * 120).toString(16).padStart(2, '0')}, 0 2px 4px rgba(0,0,0,0.3)`
                    : isEdge && pixel
                    ? `0 0 ${6 * glowIntensity}px ${glowColor}${Math.floor(glowOpacity * 200).toString(16).padStart(2, '0')}, 0 0 ${12 * glowIntensity}px ${glowColor}${Math.floor(glowOpacity * 150).toString(16).padStart(2, '0')}, 0 2px 4px rgba(0,0,0,0.3)`
                    : pixel 
                    ? `0 1px 2px rgba(0,0,0,0.3)` 
                    : '0 1px 1px rgba(0,0,0,0.1)',
                  pointerEvents: 'auto',
                  animation: isLine 
                    ? 'line-pulse 2s ease-in-out infinite' 
                    : isEdge 
                    ? 'pulse-glow 2s ease-in-out infinite' 
                    : 'none',
                  position: 'relative'
            }}
            aria-label={`pixel ${x},${y}`}
                title={pixel ? `Pixel (${x}, ${y}) - Placed by ${pixel.placedBy.slice(0, 6)}...${pixel.placedBy.slice(-4)}${isLine ? ' - PART OF LINE!' : ''}` : `Pixel (${x}, ${y}) - Click to place`}
              />
            );
          })
        )}
      </div>
      
      {/* Pixel Information Tooltip */}
      {hoveredPixel && (
        <div 
          className="fixed z-50 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 pointer-events-none"
          style={{
            left: hoverPosition.x + 10,
            top: hoverPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded border border-gray-600"
                style={{ backgroundColor: hoveredPixel.color }}
              />
              <span className="font-mono">({hoveredPixel.x}, {hoveredPixel.y})</span>
            </div>
            <div className="text-gray-300">
              Placed by: <span className="font-mono text-blue-300">{hoveredPixel.placedBy.slice(0, 6)}...{hoveredPixel.placedBy.slice(-4)}</span>
            </div>
            <div className="text-gray-300">
              Time: <span className="text-yellow-300">{new Date(hoveredPixel.placedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

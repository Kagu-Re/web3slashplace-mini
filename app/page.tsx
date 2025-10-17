'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AddressConnector } from '@/components/AddressConnector';
import { Canvas } from '@/components/Canvas';
import { CanvasControls } from '@/components/CanvasControls';
import { EventLog } from '@/components/EventLog';
import { ColorPicker } from '@/components/ColorPicker';
// Demo controller removed for production
import { Leaderboard } from '@/components/Leaderboard';
import { MobileColorPicker } from '@/components/MobileColorPicker';
import { MobileControls } from '@/components/MobileControls';
import { MobileLeaderboard } from '@/components/MobileLeaderboard';
import { Toast } from '@/components/Toast';
import type { PixelEvent } from '@/lib/eventLog';
import type { Pixel } from '@/lib/state';
import { 
  MOBILE_BREAKPOINT, 
  MOBILE_DEFAULT_ZOOM, 
  DESKTOP_DEFAULT_ZOOM,
  LEADERBOARD_POLL_INTERVAL
} from '@/lib/constants';

let socket: Socket | null = null;

export default function Page() {
  const [address, setAddress] = useState<string | null>(null);
  const [grid, setGrid] = useState<(Pixel | null)[][] | null>(null);
  const [size, setSize] = useState<number>(50);
  const [cooldownMsg, setCooldownMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [selectedColor, setSelectedColor] = useState<string>('#1f2937');
  
  // Zoom and pan state - Initialize with 1, then adjust for mobile after hydration
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  // Adjust zoom for mobile after initial render (avoid hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      setZoom(MOBILE_DEFAULT_ZOOM);
    }
  }, []);
  
  // Leaderboard state
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  
  // Demo state removed for production
  
  // Cluster visualization state
  const [showClusters, setShowClusters] = useState(true);
  
  // Mobile UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileColorPickerOpen, setMobileColorPickerOpen] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  
  // Metrics state
  const [metrics, setMetrics] = useState<any>(null);
  
  // Mobile-specific state
  const [eventLogOpen, setEventLogOpen] = useState(false);

  // init socket server
  useEffect(() => {
    let cancelled = false;

    // Initialize Socket.IO connection
    const initSocket = async () => {
      try {
        // Brief delay to ensure server is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!cancelled) {
          // Connect socket client directly
          socket = io({
            path: '/api/socketio',
            transports: ['polling'], // Force polling for Vercel serverless
            timeout: 10000,
            retries: 3,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

          socket.on('connect', () => {
            
            // Set up pixel placement listener
            if (socket) {
              socket.on('pixel_placed', ({ x, y, color, by, placedAt }) => {
      setGrid((g) => {
        if (!g) return g;
        const clone = g.map(row => [...row]);
                  clone[y][x] = {
                    x,
                    y,
                    color: color || '#1f2937',
                    placedBy: by || 'unknown',
                    placedAt: placedAt || Date.now()
                  };
        return clone;
      });
    });
              
              // Listen for pixel events
              socket.on('pixel_event', (event: PixelEvent) => {
                // Dispatch custom event for EventLog component
                window.dispatchEvent(new CustomEvent('pixel_event', { detail: event }));
              });
            }
          });

          socket.on('connect_error', (err) => {
            // Suppress expected errors from Vercel serverless limitations
            // The app will work fine with HTTP polling fallback
          });

          socket.on('error', () => {
            // Suppress Socket.IO errors (expected on Vercel)
          });
        }
      } catch (error) {
        console.warn('Failed to initialize Socket.IO:', error);
      }
    };

    initSocket();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  // load initial canvas
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/canvas');
      const j = await r.json();
      setGrid(j.grid);
      setSize(j.size);
    })();
  }, []);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  // Set up leaderboard polling
  useEffect(() => {
    fetchLeaderboard(); // Initial fetch
    const leaderboardInterval = setInterval(fetchLeaderboard, LEADERBOARD_POLL_INTERVAL);
    return () => clearInterval(leaderboardInterval);
  }, []);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Set up metrics polling (every 10 seconds)
  useEffect(() => {
    fetchMetrics(); // Initial fetch
    const metricsInterval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(metricsInterval);
  }, []);

  async function place(x: number, y: number, color: string = selectedColor, agentId?: string) {
    if (!address && !agentId) {
      setToastType('warning');
      setToastMessage('Please connect a wallet first');
      return;
    }
    
    setCooldownMsg(null);
    const r = await fetch('/api/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, color, agentId })
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      if (j.cooldownMs) {
        const secs = Math.ceil(j.cooldownMs/1000);
        setToastType('warning');
        setToastMessage(`Cooldown: wait ${secs}s`);
      } else if (r.status === 401) {
        setToastType('error');
        setToastMessage('Not authenticated. Please reconnect your wallet.');
        setAddress(null);
      } else if (r.status === 429) {
        setToastType('warning');
        setToastMessage(j.error || 'Too many requests. Slow down!');
      } else {
        setToastType('error');
        setToastMessage(j.error || 'Error placing pixel');
      }
              } else {
                // Success - no need for toast since pixel appears on canvas
                // setToastType('success');
                // setToastMessage('Pixel placed!');
              }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleClear = async () => {
    if (!address) return;
    if (!confirm('Are you sure you want to clear the entire canvas?')) return;
    
    // TODO: Implement clear canvas API endpoint
    alert('Clear canvas functionality coming soon!');
  };

  // Demo functions removed for production

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between min-w-0">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-8 min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                <span className="hidden sm:inline">Web3SlashPlace Mini</span>
                <span className="sm:hidden">W3SP</span>
              </h1>
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <a href="#" className="text-xs xl:text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">About</a>
                <a href="#" className="text-xs xl:text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">How to Play</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs xl:text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                  GitHub
                </a>
                {/* Metrics Display */}
                {metrics && (
                  <div className="flex items-center space-x-3 text-xs text-gray-500 border-l border-gray-300 pl-4">
                    <span title={`${metrics.placedPixels} pixels placed`}>🎨 {metrics.placedPixels}</span>
                    <span title={`${metrics.totalPlayers} total players`}>👥 {metrics.totalPlayers}</span>
                    <span title={`${metrics.fillPercentage}% canvas filled`}>📊 {metrics.fillPercentage}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden flex-shrink-0 ml-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Wallet Connection - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block flex-shrink-0 ml-2 sm:ml-4">
              <div className="scale-75 sm:scale-90 md:scale-100">
        <AddressConnector onAddress={(a) => setAddress(a)} />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="px-4 py-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wallet Connection for Mobile */}
            <div className="pb-3 border-b border-gray-200">
              <AddressConnector onAddress={(a) => setAddress(a)} />
      </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Small delay to ensure menu closes first
                  setTimeout(() => {
                    setLeaderboardOpen(true);
                  }, 100);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-700">Leaderboard</span>
              </button>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Small delay to ensure menu closes first
                  setTimeout(() => {
                    setMobileColorPickerOpen(true);
                  }, 100);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-5 h-5 rounded border-2 border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                <span className="text-gray-700">Color Picker</span>
              </button>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Small delay to ensure menu closes first
                  setTimeout(() => {
                    setMobileControlsOpen(true);
                  }, 100);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span className="text-gray-700">Canvas Controls</span>
              </button>
            </div>

            {/* Mobile Metrics */}
            {metrics && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Game Stats</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-2xl font-bold text-purple-600">{metrics.placedPixels}</p>
                    <p className="text-xs text-purple-800">Pixels</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalPlayers}</p>
                    <p className="text-xs text-blue-800">Players</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-2xl font-bold text-green-600">{metrics.fillPercentage}%</p>
                    <p className="text-xs text-green-800">Filled</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>🏆 Top: {metrics.topPlayer}</div>
                  <div>👥 Active: {metrics.activeInLast5Min}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - with padding for fixed header and footer */}
      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-8">
          {/* Connection Status */}
          {address && (
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Connected as</span>
                <span className="font-mono text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-lg truncate min-w-0 flex-1">
                  {address}
                </span>
              </div>
            </div>
          )}

          {/* Demo Controller removed for production */}

          {/* Canvas Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-2 md:p-8 relative">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Pixel Canvas</h2>
              {/* Desktop Color Picker - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-4">
                <ColorPicker 
                  selectedColor={selectedColor} 
                  onColorChange={setSelectedColor} 
                />
                <div className="text-sm text-gray-600">
                  {size}×{size} pixels
                </div>
              </div>
              {/* Mobile - Show current color only, clickable to open picker */}
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={() => setMobileColorPickerOpen(true)}
                  className="relative w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all shadow-sm active:scale-95"
                  style={{ backgroundColor: selectedColor }}
                  title="Tap to change color"
                  aria-label="Open color picker"
                >
                  {/* Small edit icon overlay */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Canvas with overlay controls */}
            <div className="relative">
                  <Canvas 
                    grid={grid} 
                    size={size} 
                    onPlace={place}
                    zoom={zoom}
                    panX={panX}
                    panY={panY}
                    onPanChange={(x, y) => {
                      setPanX(x);
                      setPanY(y);
                    }}
                    selectedColor={selectedColor}
                    showClusters={showClusters}
                    leaderboardData={leaderboardData}
                  />
              
              {/* Overlay Controls - Hidden on mobile, use floating menu instead */}
              <div className="hidden md:block">
                <CanvasControls
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onReset={handleReset}
                  onClear={handleClear}
                  canClear={!!address}
                  zoom={zoom}
                  showClusters={showClusters}
                  onToggleClusters={() => setShowClusters(!showClusters)}
                />
              </div>
            </div>

            {/* Cooldown Message */}
            {cooldownMsg && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700 font-medium">{cooldownMsg}</span>
                </div>
              </div>
            )}
          </div>

          {/* Helper text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Click any white pixel to place it • 5-second cooldown • Real-time updates</p>
          </div>
        </div>
      </main>

      {/* Desktop Leaderboard - Hidden on mobile */}
      <div className="hidden md:block">
        <Leaderboard 
          isOpen={leaderboardOpen} 
          onToggle={() => setLeaderboardOpen(!leaderboardOpen)} 
        />
      </div>

      {/* Fixed Footer with Event Log */}
      <footer className="fixed bottom-0 left-0 right-0 z-20">
        {/* Mobile: Collapsible Event Log */}
        <div className="md:hidden">
          <button
            onClick={() => setEventLogOpen(!eventLogOpen)}
            className="w-full bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700"
          >
            <span>📋 Event Log</span>
            <svg 
              className={`w-5 h-5 transition-transform ${eventLogOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {eventLogOpen && (
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 max-h-48 overflow-y-auto" style={{ zIndex: 9999 }}>
              <EventLog />
            </div>
          )}
        </div>
        
        {/* Desktop: Always Visible Event Log */}
        <div className="hidden md:block">
          <EventLog />
        </div>
      </footer>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Mobile Color Picker */}
      <MobileColorPicker
        isOpen={mobileColorPickerOpen}
        onClose={() => setMobileColorPickerOpen(false)}
        selectedColor={selectedColor}
        onColorChange={(color) => {
          setSelectedColor(color);
          setMobileColorPickerOpen(false);
        }}
      />

      {/* Mobile Controls */}
      <MobileControls
        isOpen={mobileControlsOpen}
        onClose={() => setMobileControlsOpen(false)}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        showClusters={showClusters}
        onToggleClusters={() => setShowClusters(!showClusters)}
      />

      {/* Mobile Leaderboard */}
      <MobileLeaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </div>
  );
}

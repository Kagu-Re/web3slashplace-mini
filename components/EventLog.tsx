'use client';

import { useEffect, useState } from 'react';
import type { PixelEvent } from '@/lib/eventLog';

export function EventLog() {
  const [events, setEvents] = useState<PixelEvent[]>([]);

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  useEffect(() => {
    // Fetch initial events
    const fetchEvents = async () => {
      try {
        const r = await fetch('/api/events');
        if (r.ok) {
          const j = await r.json();
          setEvents(j.events || []);
        }
      } catch (e) {
        console.error('Failed to fetch events:', e);
      }
    };

    fetchEvents();

    // Update timestamps every 5 seconds
    const interval = setInterval(() => {
      setEvents(prev => [...prev]); // Force re-render to update timestamps
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for new events via custom event
  useEffect(() => {
    const handleNewEvent = (e: CustomEvent<PixelEvent>) => {
      setEvents(prev => [e.detail, ...prev].slice(0, 50));
    };

    window.addEventListener('pixel_event' as any, handleNewEvent);
    return () => window.removeEventListener('pixel_event' as any, handleNewEvent);
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
          <span className="text-xs text-gray-500">{events.length} events</span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {events.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No activity yet. Be the first to place a pixel!</p>
            ) : (
              events.slice(0, 20).map((event) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[200px]"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">
                      {formatAddress(event.address)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    placed pixel at ({event.x}, {event.y})
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


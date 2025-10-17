'use client';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onClear: () => void;
  canClear: boolean;
  zoom: number;
  showClusters: boolean;
  onToggleClusters: () => void;
}

export function CanvasControls({ onZoomIn, onZoomOut, onReset, onClear, canClear, zoom, showClusters, onToggleClusters }: CanvasControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 z-10">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-2 space-y-2">
        <button
          onClick={onToggleClusters}
          title={showClusters ? "Hide Cluster Borders" : "Show Cluster Borders"}
          className={`w-12 h-12 flex items-center justify-center rounded-xl ${
            showClusters 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } font-bold text-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105`}
        >
          🔗
        </button>
        
        <button
          onClick={onZoomIn}
          disabled={zoom >= 3}
          title="Zoom In (Max 3x)"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          +
        </button>
        
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.5}
          title="Zoom Out (Min 0.5x)"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          −
        </button>
        
        <button
          onClick={onReset}
          title="Reset View"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-bold text-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          ↻
        </button>
        
        {canClear && (
          <button
            onClick={onClear}
            title="Clear Canvas"
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            🗑️
          </button>
        )}
        
        {/* Zoom indicator */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-center text-gray-600 font-medium">
            {(zoom * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

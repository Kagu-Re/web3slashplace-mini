'use client';

interface MobileControlsProps {
  isOpen: boolean;
  onClose: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showClusters: boolean;
  onToggleClusters: () => void;
}

export function MobileControls({
  isOpen,
  onClose,
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  showClusters,
  onToggleClusters
}: MobileControlsProps) {
  if (!isOpen) return null;

  // Handle swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 100) { // Swipe down threshold
        onClose();
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl w-full p-6 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-900">🎮 Canvas Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Zoom: {zoom.toFixed(2)}x</p>
          <div className="flex space-x-3">
            <button
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-800 py-4 px-6 rounded-xl font-bold text-xl transition-colors"
            >
              −
            </button>
            <button
              onClick={onReset}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onZoomIn}
              disabled={zoom >= 3}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-800 py-4 px-6 rounded-xl font-bold text-xl transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Visual Options */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Visual Options</p>
          <button
            onClick={onToggleClusters}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${
              showClusters
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl mr-2">🔗</span>
            {showClusters ? 'Hide' : 'Show'} Connected Clusters
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Pinch to zoom on touch devices. Drag to pan when zoomed in.
          </p>
        </div>
      </div>
    </div>
  );
}

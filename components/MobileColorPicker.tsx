'use client';

import { useState } from 'react';

interface MobileColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#1f2937', // Dark Gray
  '#ef4444', // Red
  '#f59e0b', // Orange
  '#fbbf24', // Yellow
  '#10b981', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
  '#6b7280', // Gray
  '#14b8a6', // Teal
];

export function MobileColorPicker({ isOpen, onClose, selectedColor, onColorChange }: MobileColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);

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
      style={{ zIndex: 9999 }}
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
            <h3 className="text-xl font-bold text-gray-900">🎨 Choose Color</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Preset Colors */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Preset Colors</p>
          <div className="grid grid-cols-6 gap-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color);
                  setCustomColor(color);
                }}
                className={`w-full aspect-square rounded-xl transition-all ${
                  selectedColor === color 
                    ? 'ring-4 ring-blue-500 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: color,
                  border: color === '#ffffff' ? '2px solid #e5e7eb' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Custom Color</p>
          <div className="flex space-x-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-16 h-16 rounded-xl border-2 border-gray-300 cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 font-mono text-lg"
              />
              <button
                onClick={() => onColorChange(customColor)}
                className="w-full mt-2 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600"
              >
                Apply Custom Color
              </button>
            </div>
          </div>
        </div>

        {/* Current Selection */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Color:</span>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-mono text-sm text-gray-800">{selectedColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const COLORS = [
  { name: 'Black', value: '#1f2937', emoji: '⚫' },
  { name: 'Red', value: '#ef4444', emoji: '🔴' },
  { name: 'Blue', value: '#3b82f6', emoji: '🔵' },
  { name: 'Green', value: '#10b981', emoji: '🟢' },
  { name: 'Yellow', value: '#f59e0b', emoji: '🟡' },
  { name: 'Purple', value: '#8b5cf6', emoji: '🟣' },
  { name: 'Orange', value: '#f97316', emoji: '🟠' },
  { name: 'Pink', value: '#ec4899', emoji: '🩷' },
  { name: 'Cyan', value: '#06b6d4', emoji: '🔵' },
  { name: 'Lime', value: '#84cc16', emoji: '🟢' },
  { name: 'Indigo', value: '#6366f1', emoji: '🔵' },
  { name: 'Rose', value: '#f43f5e', emoji: '🌹' },
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200"
      >
        <div 
          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm font-medium text-gray-700">Color</span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 p-4 z-50 min-w-[280px]">
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onColorChange(color.value);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                  selectedColor === color.value 
                    ? 'bg-gray-100 shadow-md ring-2 ring-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                title={color.name}
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs font-medium text-gray-600">{color.emoji}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Custom Color:</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

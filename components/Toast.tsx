'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }[type];

  return (
    <div className="fixed bottom-24 md:bottom-28 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
      <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 min-w-[280px] max-w-[90vw]`}>
        <span className="text-xl font-bold">{icon}</span>
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}


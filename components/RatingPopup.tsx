'use client';

import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function RatingPopup({ isOpen, onClose }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);

  if (!isOpen) return null;

  const handleRate = (stars: number) => {
    setRating(stars);
    setHasRated(true);
    // Store rating in localStorage
    localStorage.setItem('user-rating', stars.toString());
    localStorage.setItem('rating-given', 'true');
    
    // Close after a short delay
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">⭐</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {hasRated ? 'Thank You!' : 'Rate Your Experience'}
          </h3>
          <p className="text-gray-600">
            {hasRated 
              ? `You gave us ${rating} star${rating !== 1 ? 's' : ''}! We appreciate your feedback.`
              : 'You have placed 5+ pixels! How do you like CanvasW3?'}
          </p>
        </div>

        {!hasRated ? (
          <>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-5xl transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <span className={
                    star <= (hoveredStar || rating)
                      ? 'text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300'
                  }>
                    ★
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                {hoveredStar > 0 && (
                  <span>
                    {hoveredStar === 1 && "😞 Could be better"}
                    {hoveredStar === 2 && "😐 It is okay"}
                    {hoveredStar === 3 && "🙂 Good"}
                    {hoveredStar === 4 && "😊 Great!"}
                    {hoveredStar === 5 && "🤩 Amazing!"}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Skip for Now
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg text-gray-700 mb-4">
              Your feedback helps us improve!
            </p>
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Continue Playing
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          This popup will only show once per session
        </p>
      </div>
    </div>
  );
}

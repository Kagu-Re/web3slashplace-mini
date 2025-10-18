'use client';

import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutModal({ isOpen, onClose }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  if (!isOpen) return null;

  const handleRate = (stars: number) => {
    setRating(stars);
    setHasRated(true);
    // Store rating in localStorage
    localStorage.setItem('user-rating', stars.toString());
    // You could also send this to an API endpoint
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">About CanvasW3</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* How to Play */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🎮</span> How to Play
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">1. Connect Your Wallet</p>
                <p className="text-sm">Choose MetaMask, WalletConnect, or Xaman (XRPL) to connect.</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">2. Pick a Color</p>
                <p className="text-sm">Select from 12 preset colors or create your own custom color.</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">3. Place Pixels</p>
                <p className="text-sm">Click on the canvas to place your colored pixels. Try to create lines!</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">4. Build Territory</p>
                <p className="text-sm">Place pixels within 4 spaces to auto-connect and create glowing lines. Expand your territory to climb the leaderboard!</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">✨</span> Features
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Real-time Updates:</strong> See other players pixels instantly via WebSocket</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Auto-Fill Lines:</strong> Place pixels within 4 spaces to create connected lines</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Territory Control:</strong> Earn rewards based on your connected pixel clusters</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Multi-Chain Support:</strong> Works with EVM (MetaMask) and XRPL (Xaman) wallets</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Mobile Optimized:</strong> Touch controls, pinch-to-zoom, and responsive design</span>
              </li>
            </ul>
          </section>

          {/* GitHub */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">💻</span> Open Source
            </h3>
            <p className="text-gray-700 mb-3">
              This project is open source! Check out the code, contribute, or report issues on GitHub.
            </p>
            <a
              href="https://github.com/Kagu-Re/web3slashplace-mini"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </section>

          {/* Rating */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">⭐</span> Rate This App
            </h3>
            <p className="text-gray-700 mb-3">
              {hasRated ? 'Thank you for your rating!' : 'Enjoying the app? Let us know!'}
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-4xl transition-transform hover:scale-110"
                  disabled={hasRated}
                >
                  <span className={
                    star <= (hoveredStar || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }>
                    ★
                  </span>
                </button>
              ))}
              {hasRated && (
                <span className="ml-3 text-green-600 font-medium">
                  {rating} star{rating !== 1 ? 's' : ''}!
                </span>
              )}
            </div>
          </section>

          {/* Support/Donate */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">💜</span> Support Development
            </h3>
            <p className="text-gray-700 mb-4">
              If you enjoy this project, consider supporting development! Your donation helps keep the server running and development active.
            </p>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all font-medium"
              onClick={() => {
                navigator.clipboard.writeText('0x293e53080Db196BEdDD0Cfa40B70360b2a621564');
                alert('Wallet address copied!\n\n0x293e53080Db196BEdDD0Cfa40B70360b2a621564\n\nSend ETH or ERC-20 tokens to this address.');
              }}
            >
              <span className="text-xl">💰</span>
              Copy Donation Address
            </button>
            <p className="text-xs text-gray-500 mt-2">
              ETH & ERC-20: 0x293e...1564
            </p>
          </section>

          {/* Tech Stack */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🛠️</span> Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'React', 'TypeScript', 'Socket.IO', 'Wagmi', 'WalletConnect', 'TailwindCSS', 'Railway'].map((tech) => (
                <span
                  key={tech}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-2xl text-center text-sm text-gray-600">
          <p>Made with ❤️ for the Web3 community</p>
        </div>
      </div>
    </div>
  );
}


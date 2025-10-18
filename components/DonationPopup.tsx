'use client';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DonationPopup({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x293e53080Db196BEdDD0Cfa40B70360b2a621564');
    alert('✅ Wallet address copied!\n\n0x293e53080Db196BEdDD0Cfa40B70360b2a621564\n\nYou can now paste it in your wallet to send a donation. Thank you! 💜');
    onClose();
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
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">💜</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Enjoying CanvasW3?
          </h3>
          <p className="text-gray-600">
            You have placed 5+ pixels! Consider supporting the project.
          </p>
        </div>

        {/* Donation Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-3 text-center">
            Your donations help keep the server running and support ongoing development!
          </p>
          <div className="bg-white rounded p-3 mb-3">
            <p className="text-xs text-gray-500 mb-1 text-center">Ethereum Address:</p>
            <p className="text-sm font-mono text-gray-800 break-all text-center">
              0x293e53080Db196BEdDD0Cfa40B70360b2a621564
            </p>
          </div>
          <button
            onClick={handleCopyAddress}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">💰</span>
              Copy Wallet Address
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Already Donated! 🎉
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This popup will only show once per session
        </p>
      </div>
    </div>
  );
}


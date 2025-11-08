import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface InsufficientCreditsModalProps {
  required: number;
  current: number;
  onClose: () => void;
  onBuyCredits: () => void;
}

const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  required,
  current,
  onClose,
  onBuyCredits,
}) => {
  const missing = required - current;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-red-400" />
            Nicht genug Credits
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Schließen"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-300 text-lg mb-4">
              Du benötigst <strong className="text-white">{required} Credits</strong> für diese Aktion.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Dein Guthaben:</span>
                <span className="text-white font-bold">{current} Credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Benötigt:</span>
                <span className="text-red-400 font-bold">{required} Credits</span>
              </div>
              <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between items-center">
                <span className="text-gray-400">Fehlt:</span>
                <span className="text-yellow-400 font-bold">{missing} Credits</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onBuyCredits}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Credits kaufen
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Abbrechen
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>💡 Tipp: Größere Pakete bieten mehr Ersparnis pro Bild</p>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;

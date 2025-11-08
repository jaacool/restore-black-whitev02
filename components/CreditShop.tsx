import React from 'react';
import { CreditPackage, CREDIT_PACKAGES } from '../types/credits';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface CreditShopProps {
  onClose: () => void;
  onPurchase: (pkg: CreditPackage) => void;
  currentCredits: number;
}

const CreditShop: React.FC<CreditShopProps> = ({ onClose, onPurchase, currentCredits }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <SparklesIcon className="h-8 w-8 text-purple-400" />
              Credits kaufen
            </h2>
            <p className="text-gray-400 mt-2">Wähle ein Paket und restauriere deine Fotos</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Schließen"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Current Credits */}
        <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-700">
          <div className="flex items-center justify-center gap-3">
            <SparklesIcon className="h-6 w-6 text-purple-400" />
            <span className="text-xl text-gray-300">Dein Guthaben:</span>
            <span className="text-3xl font-bold text-white">{currentCredits}</span>
            <span className="text-xl text-gray-400">Credits</span>
            <span className="text-gray-500 ml-2">(≈ {Math.floor(currentCredits / 3)} Bilder)</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-blue-900/20 border-b border-gray-700">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 text-2xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">So funktioniert's:</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• <strong>3 Credits</strong> = 1 Bild (Verbessern oder Kolorieren)</li>
                <li>• <strong>6 Credits</strong> = 1 Bild (Super-Auflösung)</li>
                <li>• Credits verfallen nie und haben kein Ablaufdatum</li>
                <li>• Größere Pakete = mehr Ersparnis pro Bild</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  pkg.badge === 'popular'
                    ? 'border-yellow-500 shadow-yellow-500/20'
                    : pkg.badge === 'best-value'
                    ? 'border-purple-500 shadow-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                      pkg.badge === 'popular'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    {pkg.badge === 'popular' ? '⭐ BELIEBT' : '💎 BEST VALUE'}
                  </div>
                )}

                {/* Package Name */}
                <h3 className="text-xl font-bold text-white mb-2 text-center">{pkg.name}</h3>

                {/* Credits */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-purple-400">{pkg.credits}</div>
                  <div className="text-sm text-gray-400">Credits</div>
                  {pkg.bonusPercent && (
                    <div className="text-xs text-green-400 font-semibold mt-1">
                      +{pkg.bonusPercent}% Bonus
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="text-center mb-4 text-gray-300">
                  <div className="text-lg font-semibold">≈ {pkg.images} Bilder</div>
                  <div className="text-xs text-gray-500">
                    (oder {Math.floor(pkg.images / 2)} Super-Auflösung)
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white">€{pkg.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    €{pkg.pricePerImage.toFixed(2)} pro Bild
                  </div>
                </div>

                {/* Savings */}
                {pkg.savings && (
                  <div className="text-center mb-4">
                    <div className="inline-block bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {pkg.savings}% Ersparnis
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                <button
                  onClick={() => onPurchase(pkg)}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                    pkg.badge === 'popular'
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                      : pkg.badge === 'best-value'
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  Jetzt kaufen
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Bonus Info */}
        <div className="p-6 bg-green-900/20 border-t border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">🎁 Willkommensbonus</h3>
            <p className="text-gray-300">
              Neue Nutzer erhalten <strong className="text-green-400">15 Credits gratis</strong> (5 Bilder) zum Start!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800/50 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>Sichere Zahlung über PayPal • Credits verfallen nie • Keine versteckten Kosten</p>
        </div>
      </div>
    </div>
  );
};

export default CreditShop;

import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CREDITS_PER_IMAGE } from '../types/credits';

interface CreditDisplayProps {
  credits: number;
  onClick: () => void;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits, onClick }) => {
  const imagesRemaining = Math.floor(credits / CREDITS_PER_IMAGE);
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      title="Credits kaufen"
    >
      <SparklesIcon className="h-6 w-6" />
      <div className="flex flex-col items-start">
        <span className="text-lg leading-tight">{credits} Credits</span>
        <span className="text-sm opacity-80 leading-tight">({imagesRemaining} {imagesRemaining === 1 ? 'Bild' : 'Bilder'})</span>
      </div>
    </button>
  );
};

export default CreditDisplay;

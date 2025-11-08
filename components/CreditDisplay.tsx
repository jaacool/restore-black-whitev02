import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface CreditDisplayProps {
  credits: number;
  onClick: () => void;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      title="Credits kaufen"
    >
      <SparklesIcon className="h-5 w-5" />
      <span className="text-lg">{credits}</span>
      <span className="text-sm opacity-90">Credits</span>
    </button>
  );
};

export default CreditDisplay;

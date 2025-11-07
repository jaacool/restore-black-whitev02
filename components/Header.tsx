
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6 md:py-10 border-b border-gray-700/50">
      <div className="flex justify-center items-center gap-4">
        <SparklesIcon />
        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          AI Photo Restorer 2025
        </h1>
      </div>
      <p className="mt-4 text-lg md:text-xl text-gray-400">
        Breathe new life into old photos.
      </p>
    </header>
  );
};

export default Header;

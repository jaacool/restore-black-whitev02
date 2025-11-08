
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import packageJson from '../package.json';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6 md:py-10 border-b border-gray-700/50 relative">
      {/* Version Badge - Top Left */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4">
        <span className="text-xs text-gray-500 font-mono">
          v{packageJson.version}
        </span>
      </div>
      
      <div className="flex justify-center items-center gap-4">
        <SparklesIcon />
        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          AI Photo Restorer 2025
        </h1>
      </div>
      <p className="mt-4 text-lg md:text-xl text-gray-400">
        Erwecken Sie alte Fotos zu neuem Leben.
      </p>
    </header>
  );
};

export default Header;
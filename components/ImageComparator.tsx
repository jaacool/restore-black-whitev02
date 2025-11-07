
import React from 'react';
import Loader from './Loader';

interface ImageComparatorProps {
  original: string;
  restored: string | null;
  isLoading: boolean;
}

const ImagePanel: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">{title}</h2>
        <div className="aspect-square w-full max-w-xl bg-gray-800 rounded-xl overflow-hidden shadow-lg flex items-center justify-center border border-gray-700">
            {children}
        </div>
    </div>
);


const ImageComparator: React.FC<ImageComparatorProps> = ({ original, restored, isLoading }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImagePanel title="Original">
        <img src={original} alt="Original" className="w-full h-full object-contain" />
      </ImagePanel>
      <ImagePanel title="Restored (2025)">
        {isLoading && (
          <div className="flex flex-col items-center text-center p-4">
            <Loader />
            <p className="mt-4 font-semibold text-gray-300">AI is restoring your photo...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        )}
        {!isLoading && restored && (
          <img src={restored} alt="Restored" className="w-full h-full object-contain" />
        )}
      </ImagePanel>
    </div>
  );
};

export default ImageComparator;

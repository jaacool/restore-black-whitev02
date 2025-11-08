import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageZoomViewProps {
  originalSrc: string;
  restoredSrc: string;
  onClose: () => void;
}

// A single zoomable panel component
const ZoomPanel: React.FC<{
  title: string;
  src: string;
  transformStyle: React.CSSProperties;
  onClick: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}> = ({ title, src, transformStyle, onClick, containerRef }) => (
  <div className="flex flex-col items-center">
    <h2 className="text-xl font-bold text-gray-300 mb-2">{title}</h2>
    <div
      ref={containerRef}
      onClick={onClick}
      className="aspect-square w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-zoom-out"
      title="Click to close"
    >
      <img
        src={src}
        alt={`${title} zoomed`}
        className="w-full h-full object-cover transition-transform duration-150 ease-out"
        style={transformStyle}
        draggable="false"
      />
    </div>
  </div>
);

const ImageZoomView: React.FC<ImageZoomViewProps> = ({ originalSrc, restoredSrc, onClose }) => {
  const [origin, setOrigin] = useState({ x: 50, y: 50 }); // in percentage
  const restoredContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!restoredContainerRef.current) return;
    const rect = restoredContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const transformStyle = {
    transform: `scale(2.5)`,
    transformOrigin: `${origin.x}% ${origin.y}%`,
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-[fadeIn_0.2s_ease-out]"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
        <ZoomPanel 
          title="Original" 
          src={originalSrc} 
          transformStyle={transformStyle}
          onClick={onClose}
        />
        <ZoomPanel 
          title="Restored (2025)" 
          src={restoredSrc} 
          transformStyle={transformStyle} 
          containerRef={restoredContainerRef}
          onClick={onClose}
        />
      </div>
       <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl leading-none hover:text-gray-300 z-[101]"
          aria-label="Close zoom view"
        >
          &times;
        </button>
    </div>
  );
};

export default ImageZoomView;
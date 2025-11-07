
import React from 'react';

export const SparklesIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="url(#gradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-blue-400"
    >
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgb(96, 165, 250)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(45, 212, 191)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" />
        <path d="M5 3L6 5" />
        <path d="M19 13L20 11" />
        <path d="M3 19L5 18" />
        <path d="M13 19L11 20" />
    </svg>
);

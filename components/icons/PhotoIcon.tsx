import React from 'react';

export const PhotoIcon: React.FC<{ className?: string }> = ({ className = "mx-auto h-12 w-12 text-gray-500" }) => (
    <svg
        className={className}
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
    >
        <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H28m0-28h8a4 4 0 014 4v8m-12 8l-4-4m0 0l-4 4m4-4v12"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
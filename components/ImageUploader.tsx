
import React from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import Loader from './Loader';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  isDragging: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading, isDragging }) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader />
        <p className="mt-4 text-lg text-gray-300">Initializing AI model...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <label
        htmlFor="file-upload"
        className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-300 cursor-pointer ${
          isDragging ? 'border-blue-400 bg-gray-800/50' : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <PhotoIcon />
        <span className="mt-2 block font-semibold text-gray-200">
          Drop your photo here or click to browse
        </span>
        <span className="block text-sm text-gray-500">Supports JPG, PNG, WEBP, etc.</span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
import React, { useState, useEffect } from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import { CameraIcon } from './icons/CameraIcon';
import Loader from './Loader';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onTakePhoto: () => void;
  isLoading: boolean;
  isDragging: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onTakePhoto, isLoading, isDragging }) => {
  const [isCameraSupported, setIsCameraSupported] = useState(false);

  useEffect(() => {
    setIsCameraSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);


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
    <div className="w-full max-w-2xl text-center flex flex-col items-center gap-6">
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

      <div className="flex items-center w-full">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
      
      <button
        onClick={onTakePhoto}
        disabled={!isCameraSupported || isLoading}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        title={!isCameraSupported ? "Camera not supported by your browser" : ""}
      >
        <CameraIcon />
        Take a Photo
      </button>
    </div>
  );
};

export default ImageUploader;
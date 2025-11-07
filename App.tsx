import React, { useState, useCallback, useEffect } from 'react';
import { restorePhoto } from './services/geminiService';
import { preprocessImage } from './utils/imageUtils';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageComparator from './components/ImageComparator';
import Loader from './components/Loader';
import CameraView from './components/CameraView';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { RetryIcon } from './components/icons/RetryIcon';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const runRestoration = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setRestoredImage(null); // Clear previous result before retrying

    try {
      const pureBase64 = originalImage.split(',')[1];
      const restoredBase64 = await restorePhoto(pureBase64, originalMimeType);
      
      setRestoredImage(`data:image/png;base64,${restoredBase64}`);
    } catch (err) {
      console.error(err);
      setError('The AI failed to restore the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalMimeType]);

  const handleImageUpload = useCallback(async (file: File) => {
    resetState();
    setIsLoading(true);

    try {
      const { base64, mimeType } = await preprocessImage(file);
      setOriginalImage(base64);
      setOriginalMimeType(mimeType);
      // The useEffect below will now trigger the initial restoration
    } catch (err) {
      console.error(err);
      setError('Failed to process the uploaded image. Please try another one.');
      setIsLoading(false);
    }
  }, []);
  
  // This effect triggers the restoration automatically when a new image is ready.
  useEffect(() => {
    if (originalImage && !restoredImage && !error) {
      runRestoration();
    }
  }, [originalImage, restoredImage, error, runRestoration]);


  const resetState = () => {
    setOriginalImage(null);
    setRestoredImage(null);
    setIsLoading(false);
    setError(null);
    setOriginalMimeType('');
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading || originalImage) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, [isLoading, originalImage]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading || originalImage) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }, [isLoading, originalImage, handleImageUpload]);

  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    handleImageUpload(file);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center antialiased">
      <Header />
      <main 
        className="flex-grow container mx-auto px-4 py-8 w-full flex flex-col items-center"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {!originalImage && !isCameraOpen && (
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            onTakePhoto={() => setIsCameraOpen(true)}
            isLoading={isLoading} 
            isDragging={isDragging} 
          />
        )}

        {isCameraOpen && <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
        
        {originalImage && (
          <div className="w-full max-w-6xl flex flex-col items-center">
            <ImageComparator
              original={originalImage}
              restored={restoredImage}
              isLoading={isLoading}
            />
            {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={resetState}
                disabled={isLoading}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Restore Another Photo
              </button>
              {(restoredImage || error) && !isLoading && (
                 <button
                  onClick={runRestoration}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RetryIcon />
                  Retry
                </button>
              )}
              {restoredImage && !isLoading && (
                <a
                  href={restoredImage}
                  download="restored-photo-2025.png"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                  <DownloadIcon />
                  Download Restored Image
                </a>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="w-full text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini. Images are processed and not stored.</p>
      </footer>
    </div>
  );
}
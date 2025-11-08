
import React, { useRef, useEffect, useState } from 'react';
import Loader from './Loader';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Kamerazugriff wird von diesem Browser nicht unterstützt.");
        }
        activeStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        // Try again with user facing camera as a fallback
        try {
            activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(activeStream);
            if (videoRef.current) {
                videoRef.current.srcObject = activeStream;
            }
            setError(null); // Clear previous error
        } catch (fallbackErr) {
            console.error("Error accessing fallback camera:", fallbackErr);
            setError("Kein Kamerazugriff möglich. Bitte Berechtigungen prüfen.");
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
          onCapture(file);
        }
      }, 'image/png');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center">
            <p>{error}</p>
          </div>
        )}
        {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader />
            </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain transition-opacity duration-500 ${stream ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="mt-8 flex items-center gap-8">
        <button
          onClick={onClose}
          className="text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-white/10"
        >
          Abbrechen
        </button>
        <button
          onClick={handleCapture}
          disabled={!stream || !!error}
          className="bg-white hover:bg-gray-200 text-black font-bold p-4 rounded-full transition-all duration-300 ring-4 ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          aria-label="Foto aufnehmen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"></circle></svg>
        </button>
        <div className="w-[108px]"></div>
      </div>
    </div>
  );
};

export default CameraView;
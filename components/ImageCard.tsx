
import React from 'react';
import { ImageJob } from '../App';
import Loader from './Loader';
import { DownloadIcon } from './icons/DownloadIcon';
import { RetryIcon } from './icons/RetryIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageCardProps {
    job: ImageJob;
    onRetry: (jobId: number) => void;
    onRemove: (jobId: number) => void;
    onZoom: (jobId: number) => void;
}

const ImagePanel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`w-full flex flex-col items-center ${className}`}>
        <h2 className="text-xl font-bold text-gray-400 mb-2">{title}</h2>
        <div className="aspect-square w-full bg-gray-800 rounded-xl overflow-hidden shadow-lg flex items-center justify-center border border-gray-700">
            {children}
        </div>
    </div>
);

const ImageCard: React.FC<ImageCardProps> = ({ job, onRetry, onRemove, onZoom }) => {
    
    const renderStatus = () => {
        switch (job.status) {
            case 'tiling':
                return (
                    <div className="flex flex-col items-center text-center p-4">
                        <Loader />
                        <p className="mt-4 font-semibold text-gray-300">Teile Bild auf...</p>
                    </div>
                );
            case 'restoring':
                if (job.mode === 'super-resolution' && job.progress) {
                    return (
                        <div className="flex flex-col items-center text-center p-4">
                            <Loader />
                            <p className="mt-4 font-semibold text-gray-300">KI verbessert Kacheln...</p>
                            <p className="text-sm text-gray-500">{`(${job.progress.processed}/${job.progress.total})`}</p>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col items-center text-center p-4">
                        <Loader />
                        <p className="mt-4 font-semibold text-gray-300">KI stellt wieder her...</p>
                    </div>
                );
            case 'stitching':
                 return (
                    <div className="flex flex-col items-center text-center p-4">
                        <Loader />
                        <p className="mt-4 font-semibold text-gray-300">Setze Bild zusammen...</p>
                    </div>
                );
            case 'completed':
                return job.restoredSrc ? <img src={job.restoredSrc} alt="Restored" className="w-full h-full object-contain" /> : null;
            case 'error':
                 return (
                     <div className="p-4 text-center text-red-400 flex flex-col items-center justify-center">
                        <p className="font-semibold">Wiederherstellung fehlgeschlagen</p>
                        <p className="text-xs mt-1">{job.error}</p>
                     </div>
                );
            case 'queued':
            case 'preprocessing':
                 return (
                     <div className="p-4 text-center text-gray-400 flex flex-col items-center justify-center">
                        <Loader />
                        <p className="mt-2 text-sm">Verarbeite vor...</p>
                     </div>
                 );
            default:
                return null;
        }
    }

    return (
        <div className="bg-gray-800/50 p-4 rounded-xl relative animate-[fadeIn_0.5s_ease-out]">
             <button
                onClick={() => onRemove(job.id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white z-10 p-1 bg-gray-900/50 rounded-full transition-colors"
                aria-label="Foto entfernen"
            >
                <CloseIcon />
            </button>
            <div 
                className={`w-full grid grid-cols-2 gap-4 ${job.status === 'completed' ? 'cursor-zoom-in' : 'cursor-default'}`}
                onClick={() => job.status === 'completed' && onZoom(job.id)}
                title={job.status === 'completed' ? 'Klicken zum Zoomen und Vergleichen' : ''}
            >
                <ImagePanel title="Original">
                    {job.originalSrc ? (
                        <img src={job.originalSrc} alt="Original" className="w-full h-full object-contain" />
                    ) : (
                        <div className="p-4 text-center flex flex-col items-center justify-center">
                            <Loader />
                            <p className="mt-2 text-sm text-gray-400">Verarbeite vor...</p>
                        </div>
                    )}
                </ImagePanel>
                <ImagePanel title="Restauriert (2025)">
                     {renderStatus()}
                </ImagePanel>
            </div>
            <div className="mt-4 flex gap-2 justify-end h-10 items-center">
                {job.status === 'completed' && job.restoredSrc && (
                     <a
                        href={job.restoredSrc}
                        download={`${job.file.name.split('.')[0]}-restauriert.png`}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                        <DownloadIcon />
                        Herunterladen
                    </a>
                )}
                {(job.status === 'error' || job.status === 'completed') && (
                     <button
                        onClick={() => onRetry(job.id)}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                        <RetryIcon />
                        Erneut versuchen
                    </button>
                )}
            </div>
        </div>
    );
}

export default ImageCard;
import React from 'react';
import { ImageJob } from '../App';
import ImageCard from './ImageCard';

interface ImageGridProps {
    jobs: ImageJob[];
    onRetry: (jobId: number) => void;
    onRemove: (jobId: number) => void;
    onZoom: (jobId: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ jobs, onRetry, onRemove, onZoom }) => {
    return (
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8">
            {jobs.map(job => (
                <ImageCard key={job.id} job={job} onRetry={onRetry} onRemove={onRemove} onZoom={onZoom} />
            ))}
        </div>
    );
};

export default ImageGrid;
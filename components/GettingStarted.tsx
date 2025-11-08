import React from 'react';
import { PhotoIcon } from './icons/PhotoIcon';
import { AdjustmentsIcon } from './icons/AdjustmentsIcon';
import { MagicIcon } from './icons/MagicIcon';

const GettingStarted: React.FC = () => {
    return (
        <div className="w-full text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-bold text-white mb-6">So einfach funktioniert's</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 text-left">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full mt-1">
                        <PhotoIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-200">1. Foto hochladen</h3>
                        <p className="text-gray-400 text-sm">Ziehen Sie Ihr Bild per Drag & Drop, wählen Sie es aus oder nutzen Sie Ihre Kamera.</p>
                    </div>
                </div>
                {/* Step 2 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full mt-1">
                        <AdjustmentsIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-200">2. Modus wählen</h3>
                        <p className="text-gray-400 text-sm">Wählen Sie den passenden Modus: von kompletter Restaurierung bis zur reinen Kolorierung.</p>
                    </div>
                </div>
                {/* Step 3 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full mt-1">
                        <MagicIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-200">3. Magie erleben</h3>
                        <p className="text-gray-400 text-sm">Die KI verwandelt Ihr Foto in ein modernes Meisterwerk, als wäre es heute aufgenommen.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GettingStarted;

import React, { useState } from 'react';

interface PromptEditorProps {
  initialPrompt: string;
  defaultPrompt: string;
  onClose: () => void;
  onSave: (newPrompt: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ initialPrompt, defaultPrompt, onClose, onSave }) => {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);

  const handleSave = () => {
    onSave(currentPrompt);
  };

  const handleReset = () => {
    setCurrentPrompt(defaultPrompt);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Customize AI Prompt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        <main className="p-4 overflow-y-auto flex-grow">
          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            className="w-full h-full min-h-[400px] bg-gray-900 text-gray-300 p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            aria-label="AI Prompt Editor"
          />
        </main>
        <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end items-center gap-4 flex-shrink-0">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Save Prompt
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PromptEditor;
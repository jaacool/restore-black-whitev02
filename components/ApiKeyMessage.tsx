
import React from 'react';

const ApiKeyMessage: React.FC = () => (
  <div className="w-full max-w-2xl text-center flex flex-col items-center gap-6 p-8 bg-red-900/20 border border-red-500/50 rounded-lg animate-[fadeIn_0.5s_ease-out]">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <h2 className="text-2xl font-bold text-white">API Key Not Configured</h2>
    <p className="text-gray-300">
      This application requires a Gemini API key to function. Please set the 
      <code className="bg-gray-700 text-yellow-300 p-1 rounded mx-1 font-mono">API_KEY</code> 
      environment variable in your hosting environment (e.g., Vercel project settings) and redeploy or refresh the application.
    </p>
    <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
      Learn how to add environment variables on Vercel
    </a>
  </div>
);

export default ApiKeyMessage;
